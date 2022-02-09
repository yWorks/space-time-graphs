import { GraphMode, Shared } from '../shared'
import { Styling } from './styling'
import * as _ from 'lodash'
import {
  CenterNodesPolicy,
  FilteredGraphWrapper,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicLayout,
  ICanvasObjectDescriptor,
  IEdge,
  INode,
  IVisualTemplate,
  LayoutGraphUtilities,
  LayoutOrientation,
  LayoutStageBase,
  List,
  Mapper,
  MouseWheelBehaviors,
  Point,
  RadialLayout,
  RadialLayoutData,
  Rect,
  RectangleIndicatorInstaller,
  ScrollBarVisibility,
  SizeChangedDetectionMode,
  SvgVisual,
  TimeSpan,
} from 'yfiles'
import { CircleVisual } from './circleVisual'
import * as L from 'leaflet'
import { addHeatMap } from './heatmapBackground'

class CenterGraphStage extends LayoutStageBase {
  private centerPoint: Point

  constructor(coreLayout, centerPoint) {
    super(coreLayout)
    this.centerPoint = centerPoint
  }

  applyLayout(graph) {
    this.applyLayoutCore(graph)

    const bounds = LayoutGraphUtilities.getBoundingBoxOfNodes(graph, graph.getNodeCursor())
    LayoutGraphUtilities.moveSubgraph(
      graph,
      graph.getNodeCursor(),
      this.centerPoint.x - bounds.centerX,
      this.centerPoint.y - bounds.centerY
    )
  }
}

/**
 * Custom TileLayer rendering the tiles gray.
 */
export class GrayTileLayer extends L.TileLayer {
  constructor(url, options) {
    options = _.extend(
      {
        quotaRed: 21,
        quotaGreen: 71,
        quotaBlue: 8,
        quotaDividerTune: 0,
        quotaDivider: function () {
          return this.quotaRed + this.quotaGreen + this.quotaBlue + this.quotaDividerTune
        },
      },
      options
    )
    options.crossOrigin = true

    super(url, options)

    // @ts-ignore
    this.on('tileload', (e) => {
      // @ts-ignore
      this._renderGrayscale(e.tile)
    })
  }

  _renderGrayscale(img) {
    if (img.getAttribute('data-grayscaled')) {
      return
    }

    img.crossOrigin = ''
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const imgd = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pix = imgd.data
    for (let i = 0, n = pix.length; i < n; i += 4) {
      pix[i] =
        pix[i + 1] =
        pix[i + 2] =
          // @ts-ignore
          (this.options.quotaRed * pix[i] +
            // @ts-ignore
            this.options.quotaGreen * pix[i + 1] +
            // @ts-ignore
            this.options.quotaBlue * pix[i + 2]) /
          // @ts-ignore
          this.options.quotaDivider()
    }
    ctx.putImageData(imgd, 0, 0)
    img.setAttribute('data-grayscaled', true)
    img.src = canvas.toDataURL()
  }
}

export class GraphLayer extends L.Layer {
  graphComponent: GraphComponent
  private pane: HTMLElement
  /**
   * The container holds the graph and a div background.
   */
  private container: HTMLDivElement
  /**
   * The pane containing the map.
   */
  private mapPane: HTMLElement

  private circleVisual: any

  constructor() {
    super()
  }

  /**
   * Called when this custom layer is being added.
   * @param map
   */
  onAdd(map: L.Map): this {
    this.graphComponent = new GraphComponent()
    // define the shared graph to be used later by all elements
    // the filtering definition happens after TimelineControl etc. are created.
    Shared.graph = new FilteredGraphWrapper(
      this.graphComponent.graph,
      () => true,
      () => true
    )
    this.graphComponent.zoom = 1
    this.graphComponent.autoDrag = false
    this.graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.NEVER
    this.graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.NEVER
    this.graphComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE

    this.circleVisual = new CircleVisual()
    this.graphComponent.backgroundGroup.addChild(
      this.circleVisual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )

    this.graphComponent.sizeChangedDetection = SizeChangedDetectionMode.TIMER
    const inp: GraphViewerInputMode = new GraphViewerInputMode()
    this.graphComponent.inputMode = inp
    const self = this
    inp.addItemDoubleClickedListener((sender, args) => {
      if (Shared.graphMode === GraphMode.centric) {
        const node = args.item
        if (node) {
          self.centricLayout(node)
        }
      }
    })
    inp.mouseHoverInputMode.delay = new TimeSpan(200)
    inp.mouseHoverInputMode.duration = TimeSpan.fromSeconds(10)
    inp.mouseHoverInputMode.toolTipLocationOffset = new Point(10, 10)
    inp.addQueryItemToolTipListener((src, args) => {
      if (args.handled) {
        return
      }
      if (INode.isInstance(args.item)) {
        args.toolTip = this.createNodeTooltip(args.item)
      } else if (IEdge.isInstance(args.item)) {
        args.toolTip = this.createEdgeTooltip(args.item)
      }
      args.handled = true
    })
    inp.moveViewportInputMode.enabled = false

    // add item hover input mode to highlight nodes on hover
    const graphItemHoverInputMode = inp.itemHoverInputMode
    graphItemHoverInputMode.hoverItems = GraphItemTypes.NODE
    graphItemHoverInputMode.discardInvalidItems = false
    // add listener to react to hover changes
    graphItemHoverInputMode.addHoveredItemChangedListener((sender, event) => {
      Shared.rootComponent.updateHighlights(sender, event)
    })

    // create a custom selection template with a blue border and transparent fill
    // @ts-ignore
    const selectionTemplate = new IVisualTemplate({
      // tslint:disable-next-line:no-shadowed-variable
      createVisual(context, bounds) {
        const margin = 5
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
        ellipse.cx.baseVal.value = bounds.centerX
        ellipse.cy.baseVal.value = bounds.centerY
        ellipse.rx.baseVal.value = bounds.width / 2 + margin
        ellipse.ry.baseVal.value = bounds.height / 2 + margin
        ellipse.setAttribute('stroke', '#FFFAFF')
        ellipse.setAttribute('stroke-width', '4')
        ellipse.setAttribute('fill', 'none')
        return new SvgVisual(ellipse)
      },
      // tslint:disable-next-line:no-shadowed-variable
      updateVisual(context, oldVisual, bounds) {
        const margin = 5
        const ellipse = oldVisual.svgElement
        ellipse.cx.baseVal.value = bounds.centerX
        ellipse.cy.baseVal.value = bounds.centerY
        ellipse.rx.baseVal.value = bounds.width / 2 + margin
        ellipse.ry.baseVal.value = bounds.height / 2 + margin
        return oldVisual
      },
    })
    // register the template to be used for drawing the selection indicator of nodes
    this.graphComponent.resources.set(
      RectangleIndicatorInstaller.SELECTION_TEMPLATE_KEY,
      selectionTemplate
    )

    this.graphComponent.graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()

    const backgroundDiv = document.createElement('div')
    backgroundDiv.id = 'component-background'
    backgroundDiv.appendChild(this.graphComponent.div)
    map.createPane('graph')
    this.pane = map.getPane('graph')
    this.container = backgroundDiv
    this.pane.appendChild(this.container)
    this.mapPane = map.getPane('mapPane')
    setTimeout(() => {
      this.graphComponent.updateVisual()
    }, 400)

    map.on('zoom viewreset resize move moveend zoomend', this.updateGraphDiv, this)
    map.on('zoomstart', this.hideGraphComponent, this)
    map.on('zoomend', this.showGraphComponent, this)

    map.doubleClickZoom.disable()

    // restrict the viewport to the main world map, i.e. prevent infinite world panning
    const southWest = L.latLng(-89.98155760646617, -180)
    const northEast = L.latLng(89.99346179538875, 180)
    const bounds = L.latLngBounds(southWest, northEast)
    map.setMaxBounds(bounds)
    map.on('drag', () => {
      map.panInsideBounds(bounds, { animate: false })
    })

    function getHeat(item) {
      if (item.tag) {
        const factor = item.tag.level
        return (0.8 + 0.2 * Math.sin(Date.now() / (1000 + factor * 300))) * factor
      } else {
        if (item.sourceNode) {
          return (getHeat(item.sourceNode) + getHeat(item.targetNode)) * 0.5
        }
        return 0.5
      }
    }

    addHeatMap(this.graphComponent, getHeat)

    const invalidate = () => {
      this.graphComponent.invalidate()
      requestAnimationFrame(invalidate)
    }
    requestAnimationFrame(invalidate)

    return this
  }

  /**
   * Called when this custom layer is remored.
   * @param map
   */
  onRemove(map: L.Map): this {
    L.DomUtil.remove(this.container)
    map.off('zoom viewreset resize move', this.updateGraphDiv, this)
    this.mapPane = null
    return this
  }

  /**
   * Updates the div and graph to fit the map.
   * @param nodeLocationsMapper
   */
  updateGraphDiv(nodeLocationsMapper = null) {
    // get the current position of the mapPane
    const globalPos = L.DomUtil.getPosition(this.mapPane)
    // calculate the top-left location of our pane
    const topLeft = globalPos.multiplyBy(-1)

    // anchor it at the top-left of the screen
    L.DomUtil.setPosition(this.pane, topLeft)

    const graph = Shared.graph

    if (Shared.graphMode === GraphMode.geo) {
      // transform geo-locations and update the node locations
      graph.nodes.forEach((node) => {
        // @ts-ignore
        const layerPoint = this._map.latLngToLayerPoint(L.latLng(node.tag.lat, node.tag.lng))
        const width = node.layout.width
        const height = node.layout.height
        if (Mapper.isInstance(nodeLocationsMapper)) {
          // collect the new node locations to apply them later with an animation
          nodeLocationsMapper.set(
            node,
            new Rect(layerPoint.x - width * 0.5, layerPoint.y - height, width, height)
          )
        } else {
          // apply the new node locations
          graph.setNodeCenter(node, new Point(layerPoint.x, layerPoint.y - height * 0.5))
        }
      })

      // adjust the arc of the edges to avoid too long edges for close nodes
      Styling.updateEdgeArcs(graph)
    }

    // adjust the viewPoint in the graphComponent
    this.graphComponent.viewPoint = new Point(topLeft.x, topLeft.y)

    graph.nodePredicateChanged()
    graph.edgePredicateChanged()

    // cause an immediate repaint
    this.graphComponent.updateVisual()
  }

  /**
   * Hide graph component during zoom.
   */
  hideGraphComponent() {
    this.graphComponent.div.style.visibility = 'hidden'
  }

  /**
   * Show graph component after zooming gesture.
   */
  showGraphComponent() {
    this.graphComponent.div.style.visibility = 'visible'
  }

  /**
   * Radial layout with the given node at the center.
   * @param centerNode the node at the center.
   */
  centricLayout(centerNode = null) {
    const highlightManager = this.graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    const radialLayout = new RadialLayout()
    radialLayout.layerSpacing = 70
    radialLayout.centerNodesPolicy = CenterNodesPolicy.CUSTOM
    const graph: FilteredGraphWrapper = Shared.graph
    const center = centerNode || graph.nodes.find((node) => node.tag.name === 'Peter')

    const layoutData = new RadialLayoutData()
    layoutData.centerNodes.items = new List({ items: [center] })

    graph.mapperRegistry.createMapper(RadialLayout.NODE_INFO_DP_KEY)

    // center the graph inside the viewport to avoid nodes flying in from the sides when switched back to map mode
    const centerGraphStage = new CenterGraphStage(radialLayout, this.graphComponent.viewport.center)

    return this.graphComponent.morphLayout(centerGraphStage, new TimeSpan(700), layoutData)
  }

  treeLayout() {
    const highlightManager = this.graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()

    const hierarchicLayout = new HierarchicLayout()
    hierarchicLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
    hierarchicLayout.minimumLayerDistance = 100
    hierarchicLayout.edgeToEdgeDistance = 120
    hierarchicLayout.gridSpacing = 100
    const centerGraphStage = new CenterGraphStage(
      hierarchicLayout,
      this.graphComponent.viewport.center
    )

    return this.graphComponent.morphLayout(centerGraphStage, new TimeSpan(700))
  }

  createEdgeTooltip(item) {
    const sourceTooltip = this.createNodeTooltip(item.sourceNode)
    const targetTooltip = this.createNodeTooltip(item.targetNode)

    const link = document.createElement('div')
    const linkIcon = document.createElement('img')
    linkIcon.src = 'assets/link-icon.svg'
    linkIcon.classList.add('link-icon')
    link.appendChild(linkIcon)

    // build the tooltip container
    const tooltip = document.createElement('div')
    tooltip.classList.add('graph-tooltip', 'edge-tooltip')
    tooltip.appendChild(sourceTooltip)
    tooltip.appendChild(link)
    tooltip.appendChild(targetTooltip)
    return tooltip
  }

  createNodeTooltip(item) {
    const data = item.tag

    const titleContainer = document.createElement('div')
    titleContainer.classList.add('title')
    const image = document.createElement('img')
    image.src = data.image
    const name = document.createElement('span')
    name.innerHTML = data.name
    titleContainer.appendChild(image)
    titleContainer.appendChild(name)

    const locationContainer = document.createElement('div')
    locationContainer.classList.add('data-rows')

    const row1 = document.createElement('div')
    const lat = document.createElement('span')
    lat.innerHTML = `Latitude: ${data.lat}`
    row1.appendChild(lat)

    const row2 = document.createElement('div')
    const lng = document.createElement('span')
    lng.innerHTML = `Longitude: ${data.lng}`
    row2.appendChild(lng)

    const row3 = document.createElement('div')
    const date = document.createElement('span')
    date.innerHTML = `Date: ${data.date}`
    row3.appendChild(date)

    locationContainer.appendChild(row1)
    locationContainer.appendChild(row2)
    locationContainer.appendChild(row3)

    const contamination = document.createElement('div')
    contamination.innerHTML = 'Contamination Level:'
    const progress = document.createElement('div')
    progress.classList.add('progress')
    progress.style.width = `100%`
    const progressBar = document.createElement('div')
    progressBar.classList.add('progress-bar')
    progressBar.style.width = `${data.level * 100}%`
    progress.appendChild(progressBar)

    // build the tooltip container
    const tooltip = document.createElement('div')
    tooltip.classList.add('graph-tooltip')
    tooltip.appendChild(titleContainer)
    tooltip.appendChild(locationContainer)
    tooltip.appendChild(contamination)
    tooltip.appendChild(progress)
    return tooltip
  }
}
