import { IAppState } from '../IAppState'
import { ActionReducerMap } from '@ngrx/store'
import { GraphActions } from '../actions'
import { currentNodeReducer, edgeReducer, graphModeReducer, nodeReducer } from './graphReducer'

export const reducers: ActionReducerMap<IAppState, GraphActions> = {
  currentNode: currentNodeReducer,
  nodes: nodeReducer,
  edges: edgeReducer,
  graphMode: graphModeReducer,
}
