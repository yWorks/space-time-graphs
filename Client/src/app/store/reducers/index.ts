import { environment } from '../../../environments/environment'

import { IAppState } from '../IAppState'
import { ActionReducerMap } from '@ngrx/store'
import { GraphActions } from '../actions'
import {
  edgeReducer,
  nodeReducer,
  currentNodeReducer,
  timelineReducer,
  graphModeReducer
} from './graphReducer'

export const reducers: ActionReducerMap<IAppState, GraphActions> = {
  currentNode: currentNodeReducer,
  nodes: nodeReducer,
  edges: edgeReducer,
  timelineVisible: timelineReducer,
  graphMode: graphModeReducer
}
