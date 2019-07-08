import { Action } from '@ngrx/store'
import * as _ from 'lodash'
import { IEdge, IGraphElement, INode } from '../../main/data/entities'
import { GraphMode } from '../../main/shared'

export enum NodeActionTypes {
  Add = '[Graph Component] Add Node',
  Delete = '[Graph Component] Delete Node',
  DeleteAll = '[Graph Component] Delete All Node',
  SetCurrentNode = '[Graph Component] Set Current Node'
}

export enum EdgeActionTypes {
  Add = '[Graph Component] Add Edge',
  Delete = '[Graph Component] Delete Edge',
  DeleteAll = '[Graph Component] Delete All Edge'
}

export enum TimelineActionTypes {
  Hide = '[Graph Component] Hide Timeline',
  Show = '[Graph Component] Show Timeline'
}

export enum GraphModeActionTypes {
  Set = '[Graph Component] Set Mode'
}

export enum NetworkActionTypes {
  SetNetworkName = '[Graph Component] Set Name'
}

export class AddNode implements Action {
  readonly type = NodeActionTypes.Add
  nodeData: INode

  constructor(nodeData: INode) {
    if (_.isNil(nodeData)) {
      throw new Error('Cannot add nil node.')
    }
    this.nodeData = nodeData
  }
}

export class SetGraphMode implements Action {
  readonly type = GraphModeActionTypes.Set
  mode: GraphMode

  constructor(mode: GraphMode) {
    if (_.isNil(mode)) {
      throw new Error('Cannot add nil node.')
    }
    this.mode = mode
  }
}

export class DeleteNode implements Action {
  readonly type = NodeActionTypes.Delete
  nodeData: IGraphElement

  constructor(nodeData: IGraphElement) {
    if (_.isNil(nodeData)) {
      throw new Error('Cannot delete nil node.')
    }
    this.nodeData = nodeData
  }
}

export class DeleteAllNode implements Action {
  readonly type = NodeActionTypes.DeleteAll

  constructor() {}
}

export class SetCurrentNode implements Action {
  readonly type = NodeActionTypes.SetCurrentNode
  nodeData: IGraphElement

  constructor(nodeData: INode) {
    this.nodeData = nodeData
  }
}

export class SetNetworkName implements Action {
  readonly type = NetworkActionTypes.SetNetworkName
  name: string

  constructor(name: string) {
    this.name = name
  }
}

export class AddEdge implements Action {
  readonly type = EdgeActionTypes.Add
  edgeData: IEdge

  constructor(edgeData: IEdge) {
    if (_.isNil(edgeData)) {
      throw new Error('Cannot add nil edge.')
    }
    this.edgeData = edgeData
  }
}

export class ShowTimeline implements Action {
  readonly type = TimelineActionTypes.Show

  constructor() {}
}

export class HideTimeline implements Action {
  readonly type = TimelineActionTypes.Hide

  constructor() {}
}

export class DeleteEdge implements Action {
  readonly type = EdgeActionTypes.Delete
  edgeData: IEdge

  constructor(edgeData: IEdge) {
    if (_.isNil(edgeData)) {
      throw new Error('Cannot delete nil edge.')
    }
    this.edgeData = edgeData
  }
}

export class DeleteAllEdge implements Action {
  readonly type = EdgeActionTypes.DeleteAll

  constructor() {}
}

export type NodeActions = AddNode | DeleteNode | SetCurrentNode | DeleteAllNode
export type EdgeActions = AddEdge | DeleteEdge | DeleteAllEdge
export type TimelineActions = ShowTimeline | HideTimeline
export type SetGraphModeActions = SetGraphMode
