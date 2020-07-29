import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnInit,
  ViewChild
} from '@angular/core'
import * as L from 'leaflet'
import { GraphMode, Shared } from './shared'

import * as _ from 'lodash'

import { select, Store } from '@ngrx/store'
import { IAppState } from '../store/IAppState'

import 'leaflet-draw'
import { IEdge, INode } from './data/entities'
import { TimelineLeafletControl } from './timeline/timeline'
import { MainHighlightManager } from './graph/highlighters'
import { Styling } from './graph/styling'
import { GraphLayer, GrayTileLayer } from './graph/graphLayer'
import { ToggleGraphControl } from './toolbar/toolbarControl'
import { FilteredGraphWrapper, GraphComponent, GraphViewerInputMode } from 'yfiles'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements AfterViewInit, OnInit {
  @ViewChild('graphComponentRef', { static: true }) graphComponentRef: ElementRef

  graphComponent: GraphComponent
  geo: any
  _nodes: Array<any> = []
  _edges: Array<IEdge> = []
  timeline: TimelineLeafletControl
  highlightIndicatorManager: MainHighlightManager

  @Input('nodes')
  set nodes(value: INode[]) {
    this._nodes = value
    this.updateGraph()
  }

  get nodes() {
    return this._nodes
  }

  @Input('edges')
  set relationships(value: IEdge[]) {
    this._edges = value
    this.updateGraph()
  }

  @HostListener('window:resize')
  onResize() {
    this.timeline.render()
  }

  get edges() {
    return this._edges
  }

  constructor(private store: Store<IAppState>, private zone: NgZone) {
    Styling.setTheme()
    Shared.store = store
    this.store.pipe(select('graphMode')).subscribe(mode => {
      if (!_.isNil(mode)) {
        setTimeout(() => this.onResize(), 0)
      }
    })
  }

  updateHighlights(sender, event) {
    const item = event.item
    const oldItem = event.oldItem

    const highlightManager = this.highlightIndicatorManager

    if (item) {
      highlightManager.addHighlight(item)
    }

    if (oldItem) {
      highlightManager.removeHighlight(oldItem)
    }

    // this.timeline.(item)
  }

  ngAfterViewInit() {
    Shared.rootElement = this.graphComponentRef.nativeElement
    this.geo = L.map(Shared.rootElement)
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const osmAttrib =
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'

    this.geo.setView(L.latLng( 40.709222,1.154546), 5)
    this.geo.addLayer(
      // new L.TileLayer(osmUrl, {
      new GrayTileLayer(osmUrl, {
        minZoom: 3,
        maxZoom: 12,
        attribution: osmAttrib
      })
    )

    Shared.graphLayer = new GraphLayer()
    this.geo.addLayer(Shared.graphLayer)
    this.graphComponent = Shared.graphLayer.graphComponent
    this.highlightIndicatorManager = new MainHighlightManager(this.graphComponent)

    Shared.rootComponent = this
    const self = this
    try {
      self.assembleGraph().then(wrapper => {
        if (_.isNil(wrapper)) {
          return
        }
        Styling.initializeDefaultStyles(Shared.graph)
        const toggler = new ToggleGraphControl()
        toggler.graphComponent = self.graphComponent
        toggler.graphLayer = Shared.graphLayer
        // @ts-ignore
        toggler.addTo(self.geo)

        // add the timeline control to the map
        self.timeline = new TimelineLeafletControl()
        self.timeline.addTo(self.geo)
        self.timeline.render()
        self.timeline.setVisible(true)
        Shared.timelineControl = this.timeline
        Shared.graphLayer.updateGraphDiv()
      })
    } catch (e) {
      self.zone.runTask(() => {
        throw e
      })
    }
  }

  updateLayout() {
    switch (Shared.graphMode) {
      case GraphMode.geo:
        Shared.graphLayer.updateGraphDiv()
        break
      case GraphMode.centric:
        Shared.graphLayer.centricLayout()
        break
      case GraphMode.tree:
        Shared.graphLayer.treeLayout()
        break
    }
  }

  /**
   * Based on data binding.
   */
  private updateGraph() {
    if (_.isNil(this.graphComponent)) {
      return
    }
    const self = this
    try {
      self.assembleGraph().then(wrapper => {
        if (_.isNil(wrapper)) {
          return
        }
        this.updateLayout()

        if (!this.graphComponent.currentItem && this.graphComponent.graph.nodes.size > 0) {
          // select a node for demonstration purpose
          const inputMode = this.graphComponent.inputMode as GraphViewerInputMode
          const item = this.graphComponent.graph.nodes.first()
          this.graphComponent.currentItem = item
          inputMode.setSelected(item, true)
        }

        // self.timeline.updater();
        // self.timeline.filteringEnabled(false);
      })
    } catch (e) {
      self.zone.runTask(() => {
        throw e
      })
    }
  }

  /**
   * Creates a graph from the redux store.
   * Defines the 'Shared.graph' used across the different elements.
   */
  private assembleGraph() {
    if (_.isNil(Shared.graphLayer)) {
      return Promise.resolve(null)
    }
    const graph = Shared.graph.wrappedGraph
    const nodeMap = {}
    graph.clear()
    this.nodes.forEach(n => {
      nodeMap[n.id] = graph.createNode({
        tag: n
      })
    })
    this.edges.forEach(e => {
      const fromNode = nodeMap[e.from]
      const toNode = nodeMap[e.to]
      if (fromNode && toNode) {
        graph.createEdge(fromNode, toNode)
      }
    })
    this.createFilteredGraph(graph)

    this.graphComponent.graph = Shared.graph
    Styling.applyMapStyles(graph)
    return Promise.resolve(Shared.graph)
  }

  /**
   * The filtered wrapper defines what part of the graph is visible in function
   * of the time-window.
   * @param graph
   */
  createFilteredGraph(graph) {
    Shared.graph = new FilteredGraphWrapper(
      graph,
      node => {
        if (Shared.timelineControl) {
          return Shared.timelineControl.isInTimeFrame(node.tag)
        } else {
          return true
        }
      },
      () => true
    )
  }

  ngOnInit(): void {}
}
