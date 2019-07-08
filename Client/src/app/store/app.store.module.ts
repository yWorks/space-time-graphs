import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Action, ActionReducerMap, MetaReducer, StoreModule } from '@ngrx/store'
import { IAppState } from './IAppState'
import { environment } from '../../environments/environment'
import { reducers } from './reducers'
import { GraphMode } from '../main/shared'

export const metaReducers: MetaReducer<IAppState>[] = !environment.production ? [] : []

const initialState: IAppState = {
  nodes: [],
  currentNode: null,
  edges: [],
  timelineVisible: false,
  graphMode: GraphMode.geo
}

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot(reducers, {
      metaReducers: metaReducers,
      initialState: initialState
    }),
    CommonModule
  ]
})
export class AppStoreModule {}
