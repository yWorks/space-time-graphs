import { Action } from '@ngrx/store'

export enum StoreActionTypes {
  Reset = '[Counter Component] Reset'
}

export class Reset implements Action {
  readonly type = StoreActionTypes.Reset
}

export type StoreActions = Reset
