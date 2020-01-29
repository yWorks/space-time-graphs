import {
  EdgeActionTypes,
  GraphModeActionTypes,
  NodeActionTypes,
  TimelineActionTypes
} from '../actions/graphActions'
import { GraphActions } from '../actions'
import * as _ from 'lodash'
import { IEdge, INode } from '../../main/data/entities'
import { GraphMode } from '../../main/shared'

export function nodeReducer(state: Array<INode> = [], action: GraphActions): Array<INode> {
  switch (action.type) {
    case NodeActionTypes.Delete:
      // in-place altered array
      _.remove(state, n => n.id === action.nodeData.id)
      return [...state]
    case NodeActionTypes.Add:
      state.push(action.nodeData)
      return [...state]
    case NodeActionTypes.DeleteAll:
      return []
    default:
      return state
  }
}

export function currentNodeReducer(state: INode, action: GraphActions): INode {
  if (action.type === NodeActionTypes.SetCurrentNode) {
    if (state && action.nodeData) {
      // console.log('current: ' + (action.nodeData as INode).name);
    }
    return action.nodeData as INode
  } else {
    return state
  }
}

export function edgeReducer(state: Array<IEdge> = [], action: GraphActions) {
  switch (action.type) {
    case EdgeActionTypes.Add:
      state.push(action.edgeData)
      return [...state]
    case EdgeActionTypes.Delete:
      _.remove(state, n => n.id === action.edgeData.id)
      return [...state]
    case EdgeActionTypes.DeleteAll:
      return []
    default:
      return state
  }
}

export function graphModeReducer(state: GraphMode, action: GraphActions) {
  if (action.type === GraphModeActionTypes.Set) {
    return action.mode
  } else {
    return state
  }
}
