import * as L from 'leaflet'
import { GraphLayer } from '../graph/graphLayer'
import { GraphMode, Shared, Utils } from '../shared'
import { ZoomAnimation } from '../graph/zoomAnimation'
import { Styling } from '../graph/styling'
import { SetGraphMode } from '../../store/actions/graphActions'
import {
  Animator,
  GraphComponent,
  IAnimation,
  ICollection,
  INode,
  IRectangle,
  List,
  Mapper,
  TimeSpan,
} from 'yfiles'

export class ToggleGraphControl extends L.Control {
  graphComponent: GraphComponent
  graphLayer: GraphLayer
  viewportCenter: any
  layoutRunning = false

  onAdd(map: L.Map): HTMLElement {
    const div = document.createElement('div')

    const treeButton = document.createElement('div')
    treeButton.id = 'toggle-graph-mode-treeButton'
    treeButton.title = 'Switch to tree view'
    Utils.addClass(treeButton, 'treeButton')

    const centricButton = document.createElement('div')
    centricButton.id = 'toggle-graph-mode-centricButton'
    centricButton.title = 'Switch to centric view'
    Utils.addClass(centricButton, 'centricButton')

    const geoButton = document.createElement('div')
    geoButton.id = 'toggle-graph-mode-geoButton'
    geoButton.title = 'Switch to geographic view'
    Utils.addClass(geoButton, 'geoButton')

    geoButton.addEventListener('click', () => {
      if (Shared.graphMode === GraphMode.geo) {
        return
      }
      Shared.graphMode = GraphMode.geo
      const graph = Shared.graph
      Shared.store.dispatch(new SetGraphMode(Shared.graphMode))

      const backgroundDiv = document.getElementById('component-background')

      map.dragging.enable()
      map.touchZoom.enable()
      map.scrollWheelZoom.enable()
      map.boxZoom.enable()
      map.keyboard.enable()
      map.addControl(map.zoomControl)
      if (map.tap) {
        map.tap.enable()
      }
      Shared.rootElement.style.cursor = 'grab'

      backgroundDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)'

      // show the nodes on geo-coordinates
      // update the graph component and collect the new node locations in a mapper
      const nodeLocations = new Mapper<INode, IRectangle>()
      this.graphLayer.updateGraphDiv(nodeLocations)

      const zoomAnimation = new ZoomAnimation(this.graphComponent, 1, this.viewportCenter, 700)
      const graphAnimation: IAnimation = IAnimation.createGraphAnimation(
        this.graphComponent.graph,
        nodeLocations,
        null,
        null,
        null,
        new TimeSpan(700)
      )
      this.graphComponent.graph.edges.forEach((edge) => this.graphComponent.graph.clearBends(edge))
      const anims: ICollection<IAnimation> = new List<IAnimation>({
        items: [zoomAnimation, graphAnimation],
      })
      const animation = IAnimation.createParallelAnimation(anims)
      const animator = new Animator(this.graphComponent)
      animator.animate(animation).then(() => {
        Styling.applyMapStyles(graph.wrappedGraph)
        map.invalidateSize()
        // centricButton.disabled = false
      })
    })
    centricButton.addEventListener('click', () => {
      this.setGraphMode(map, GraphMode.centric)
    })

    treeButton.addEventListener('click', () => {
      this.setGraphMode(map, GraphMode.tree)
    })

    div.appendChild(centricButton)
    div.appendChild(geoButton)
    div.appendChild(treeButton)
    return div
  }

  setGraphMode(map: L.Map, graphMode: GraphMode): void {
    if (Shared.graphMode === graphMode) {
      return
    }
    Shared.graphMode = graphMode
    const graph = Shared.graph
    Shared.store.dispatch(new SetGraphMode(Shared.graphMode))

    const backgroundDiv = document.getElementById('component-background')

    // disable the map when the graph is shown with radial layout
    map.dragging.disable()
    map.touchZoom.disable()
    map.scrollWheelZoom.disable()
    map.boxZoom.disable()
    map.keyboard.disable()
    map.removeControl(map.zoomControl)

    if (map.tap) {
      map.tap.disable()
    }
    Shared.rootElement.style.cursor = 'default'

    // store viewport center to be able to restore the viewport when toggling back
    this.viewportCenter = this.graphComponent.viewport.center

    // run a layout with animation
    backgroundDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'
    Styling.applyLayoutStyles(graph.wrappedGraph)
    if (!this.layoutRunning) {
      this.layoutRunning = true
      Shared.graph.edges.forEach((edge) => graph.clearBends(edge))

      let promise: Promise<any> = null
      switch (graphMode) {
        case GraphMode.tree:
          promise = this.graphLayer.treeLayout()
          break
        case GraphMode.centric:
          promise = this.graphLayer.centricLayout()
          break
      }
      if (promise) {
        promise.then(() => {
          this.layoutRunning = false
        })
      }
    }
  }

  onRemove(map: L.Map): void {
    super.onRemove(map)
  }
}
