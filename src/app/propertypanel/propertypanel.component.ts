import { Component, Input, OnInit } from '@angular/core'
import * as _ from 'lodash'
import { select, Store } from '@ngrx/store'
import { IAppState } from '../store/IAppState'

import { IEdge, INode } from '../main/data/entities'
import { Shared } from '../main/shared'
import { MatDialog } from '@angular/material/dialog'
import { AboutDialogComponent } from '../main/aboutdialog/aboutdialog.component'

@Component({
  selector: 'app-propertypanel',
  templateUrl: './propertypanel.component.html',
  styleUrls: ['./propertypanel.component.css']
})
export class PropertyPanelComponent implements OnInit {
  @Input('nodes') nodes: Array<INode>
  nodeCount: number
  edgeCount: number
  vertices: INode[]
  links: IEdge[]
  $currentNode: INode
  predecessors: any
  successors: any

  constructor(private store: Store<IAppState>, public dialog: MatDialog) {
    this.store.pipe(select(state => state.currentNode)).subscribe(cnode => {
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
  }

  openDialog(): void {
    this.dialog.open(AboutDialogComponent, {
      width: '600px'
    })
  }
}
