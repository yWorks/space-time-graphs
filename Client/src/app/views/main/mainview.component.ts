import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'

import 'yfiles/view-layout-bridge'

import * as _ from 'lodash'
import { select, Store } from '@ngrx/store'
import { Observable, Subscription } from 'rxjs'
import { IAppState } from '../../store/IAppState'
import { MainComponent } from '../../main/main.component'
import {
  AddEdge,
  AddNode,
  DeleteAllEdge,
  DeleteAllNode,
  SetCurrentNode,
  SetGraphMode,
  SetNetworkName
} from '../../store/actions/graphActions'
import { EdgeData, IEdge, INode, NodeData } from '../../main/data/entities'
import { GraphMode, Shared } from '../../main/shared'
import { Reset } from '../../store/actions/storeActions'
import { ICommand } from 'yfiles'

@Component({
  selector: 'app-mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.css'],
  host: {
    class: 'full'
  }
})
export class MainViewComponent implements AfterViewInit, OnInit {
  @ViewChild(MainComponent) private gcComponent: MainComponent
  graphMode: Observable<GraphMode>
  geoMode = GraphMode.geo
  currentNode: Observable<INode>
  nodes: Observable<INode[]>
  edges: Observable<IEdge[]>
  timelineVisible: Observable<boolean>

  constructor(private store: Store<IAppState>) {
    this.store.pipe(select('graphMode')).subscribe(mode => {
      if (!_.isNil(mode)) {
        this.graphMode = mode
      }
    })
  }

  ngAfterViewInit() {
    const graphComponent = this.gcComponent.graphComponent
    const self = this
    graphComponent.addCurrentItemChangedListener(() => {
      if (graphComponent.currentItem) {
        self.store.dispatch(new SetCurrentNode(graphComponent.currentItem.tag))
      } else {
        self.store.dispatch(new SetCurrentNode(null))
      }
    })
  }

  zoomIn() {
    ICommand.INCREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }

  zoomOriginal() {
    ICommand.ZOOM.execute(1, this.gcComponent.graphComponent)
  }

  zoomOut() {
    ICommand.DECREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }

  fitContent() {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, this.gcComponent.graphComponent)
  }

  ngOnInit(): void {
    this.store.pipe(select('edges')).subscribe(es => {
      this.edges = es
    })
    this.store.pipe(select('nodes')).subscribe(ns => {
      this.nodes = ns
    })

    this.currentNode = this.store.select('currentNode')
    this.timelineVisible = this.store.select('timelineVisible')
    // this.store.dispatch(new Reset());

    this.store.dispatch(new Reset())
    // _.range(20).forEach(i => Shared.addRandomNode(this.store));
    this.store.dispatch(new SetGraphMode(GraphMode.geo))
  }
}
