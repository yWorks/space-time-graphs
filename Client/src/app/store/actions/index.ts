import {
  EdgeActions,
  EdgeActionTypes,
  GraphModeActionTypes,
  NodeActions,
  NodeActionTypes,
  SetGraphModeActions,
  TimelineActions
} from './graphActions'

export type GraphActionTypes = NodeActionTypes | EdgeActionTypes | GraphModeActionTypes
export type GraphActions = NodeActions | EdgeActions | TimelineActions | SetGraphModeActions
