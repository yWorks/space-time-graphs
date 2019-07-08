import { Component, Input, OnInit } from '@angular/core'
import {
  AddEdge,
  AddNode,
  DeleteAllEdge,
  DeleteAllNode,
  DeleteEdge,
  DeleteNode,
  HideTimeline,
  SetNetworkName,
  ShowTimeline,
  TimelineActionTypes
} from '../store/actions/graphActions'
import * as _ from 'lodash'
import { select, Store } from '@ngrx/store'
import { IAppState } from '../store/IAppState'
import * as faker from 'faker'
import { Observable, Subscription } from 'rxjs'

import * as moment from 'moment'
import { switchMap } from 'rxjs/operators'
import { EdgeData, IEdge, INode, NodeData } from '../main/data/entities'
import { Shared } from '../main/shared'
import { MatDialog } from '@angular/material'
import { AboutDialogComponent } from '../main/aboutdialog/aboutdialog.component'

@Component({
  selector: 'app-propertypanel',
  templateUrl: './propertypanel.component.html',
  styleUrls: ['./propertypanel.component.css']
})
export class PropertyPanelComponent implements OnInit {
  @Input('nodes') nodes: Observable<Array<INode>>
  nodeCount: Observable<number>
  edgeCount: Observable<number>
  _timelineVisible: Observable<boolean>
  currentFileName: string
  currentTitle: string
  vertices: INode[]
  links: IEdge[]
  $currentNode: Observable<INode>
  predecessors: any
  successors: any

  constructor(private store: Store<IAppState>, public dialog: MatDialog) {
    this.store.pipe(select('currentNode')).subscribe(cnode => {
      if (_.isNil(cnode)) {
        this.$currentNode = null
      } else {
        this.$currentNode = cnode
        for (let i = 0; i < Shared.graph.nodes.size; i++) {
          const n = Shared.graph.nodes.get(i)
          if (n.tag.id === cnode.id) {
            this.predecessors = Shared.graph.predecessors(n).toArray()
            this.successors = Shared.graph.successors(n).toArray()
          }
        }
      }
    })
  }

  get timelineVisible() {
    return this._timelineVisible
  }

  @Input('timelineVisible')
  set timelineVisible(value) {
    this._timelineVisible = value
    this.store.dispatch(value ? new ShowTimeline() : new HideTimeline())
  }

  ngOnInit() {
    const self = this
    this.store.pipe(select('nodes')).subscribe(ns => {
      self.nodeCount = ns.length
      self.nodes = ns
      this.vertices = ns
    })
    this.store.pipe(select('edges')).subscribe(es => {
      self.edgeCount = es.length
      this.links = es
    })

    this.store.pipe(select('timelineVisible')).subscribe(tf => {
      self._timelineVisible = tf
    })

    this.store.pipe(select('networkName')).subscribe(name => {
      if (_.isNil(name) || name.length === 0) {
        return
      }
      self.currentFileName = name
    })

    this.store.dispatch(new ShowTimeline())
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: '600px'
    })
  }

  /**
   * Adds a random node and links it to a randomly chosen existing node.
   */
  addRandomNode() {
    const newId = _.random(50, 1e10)
    let otherNode = null
    let secondNode = null

    function getTwo(items) {
      otherNode = _.sample(items)
      secondNode = _.sample(items)
    }

    const sub: Subscription = this.store.pipe(select('nodes')).subscribe(getTwo)
    sub.unsubscribe()
    const baseDate = '2016-10-16'
    const offset = _.random(-300, 300)
    const blob = {
      id: newId,
      name: faker.name.findName(),
      lat: _.random(45.0, 55.0),
      lng: _.random(6.4, 22.6),
      image: 'assets/person.png',
      style: 'entity',
      belongsToGroup: false,
      badges: _.sampleSize(
        ['ar', 'tf', 'co', 'p', 'a', 'mv', 'po', 'me', 'mo', 'r', 'rh', 's'],
        _.random(1, 8)
      ),
      enter: [
        moment(baseDate)
          .add(offset, 'd')
          .toDate()
          .toString()
      ],
      exit: [
        moment(baseDate)
          .add(offset + 1, 'd')
          .toDate()
          .toString()
      ]
    }
    this.store.dispatch(new AddNode(new NodeData(blob)))
    if (!_.isNil(otherNode)) {
      // likely no other nodes yet

      this.store.dispatch(
        new AddEdge(
          new EdgeData({
            from: newId.toString(),
            to: otherNode.id.toString(),
            id: _.random(50, 1e10)
          })
        )
      )
    }

    // small chance of connecting to a second one
    if (Math.random() < 0.3 && otherNode.id !== secondNode.id) {
      this.store.dispatch(
        new AddEdge(
          new EdgeData({
            from: newId.toString(),
            to: secondNode.id.toString(),
            id: _.random(50, 1e10)
          })
        )
      )
    }
  }

  deleteRandomNode() {
    let nodeToRemove: INode = null
    const sub: Subscription = this.store.pipe(select('nodes')).subscribe(s => {
      nodeToRemove = _.sample(s)
    })
    sub.unsubscribe()
    if (_.isNil(nodeToRemove)) {
      // no nodes in the graph
      return
    }
    const idToRemove = nodeToRemove.id

    const coll: IEdge[] = []
    const sub2 = this.store.pipe(select('edges')).subscribe(es => {
      es.forEach(e => {
        if (e.from === idToRemove.toString() || e.to === idToRemove.toString()) {
          coll.push(e)
        }
      })
    })
    sub2.unsubscribe()
    coll.forEach(e => this.store.dispatch(new DeleteEdge(e)))
    this.store.dispatch(new DeleteNode({ id: idToRemove }))
  }

  toggleTimeline() {}

  hideTimeline() {
    this.store.dispatch(new HideTimeline())
  }

  showTimeline() {
    this.store.dispatch(new ShowTimeline())
  }
}
