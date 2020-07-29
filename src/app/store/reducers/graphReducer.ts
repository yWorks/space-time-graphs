import {
  EdgeActionTypes,
  GraphModeActionTypes,
  NodeActionTypes,
  TimelineActionTypes
} from '../actions/graphActions'
import { GraphActions } from '../actions'
import { IEdge, INode } from '../../main/data/entities'
import { GraphMode } from '../../main/shared'

export function nodeReducer(state: Array<INode> = [], action: GraphActions): Array<INode> {
  switch (action.type) {
    case NodeActionTypes.Delete:
      return state.filter(n => n.id !== action.nodeData.id)
    case NodeActionTypes.Add:
      return state.concat(action.nodeData)
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
      return state.concat(action.edgeData)
    case EdgeActionTypes.Delete:
      return state.filter(n => n.id !== action.edgeData.id)
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
