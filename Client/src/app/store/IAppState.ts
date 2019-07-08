/**
 * Defines the application state.
 */
import { IEdge, INode } from '../main/data/entities'
import { GraphMode } from '../main/shared'

export interface IAppState {
  currentNode: INode
  nodes: Array<INode>
  edges: Array<IEdge>
  timelineVisible: boolean
  graphMode: string
}
