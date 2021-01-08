import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'

import 'yfiles/view-layout-bridge'

import * as _ from 'lodash'
import { select, Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { IAppState } from '../../store/IAppState'
import { MainComponent } from '../../main/main.component'
import { SetCurrentNode, SetGraphMode } from '../../store/actions/graphActions'
import { IEdge, INode } from '../../main/data/entities'
import { GraphMode } from '../../main/shared'
import { Reset } from '../../store/actions/storeActions'

@Component({
  selector: 'app-mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.css'],
  host: {
    class: 'full',
  },
})
export class MainViewComponent implements AfterViewInit, OnInit {
  @ViewChild(MainComponent, { static: true }) private gcComponent: MainComponent
  graphMode: GraphMode
  geoMode = GraphMode.geo
  currentNode: Observable<INode>
  nodes: INode[]
  edges: IEdge[]

  constructor(private store: Store<IAppState>) {
    this.store.pipe(select('graphMode')).subscribe((mode) => {
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

  ngOnInit(): void {
    this.store.pipe(select('edges')).subscribe((es) => {
      this.edges = es
    })
    this.store.pipe(select('nodes')).subscribe((ns) => {
      this.nodes = ns
    })

    this.currentNode = this.store.select('currentNode')

    this.store.dispatch(new Reset())
    this.store.dispatch(new SetGraphMode(GraphMode.geo))
  }
}
