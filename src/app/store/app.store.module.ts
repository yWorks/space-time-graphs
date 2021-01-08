import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MetaReducer, StoreModule } from '@ngrx/store'
import { IAppState } from './IAppState'
import { environment } from '../../environments/environment'
import { reducers } from './reducers'
import { GraphMode } from '../main/shared'

export const metaReducers: MetaReducer<IAppState>[] = !environment.production ? [] : []

const initialState: IAppState = {
  nodes: [],
  currentNode: null,
  edges: [],
  graphMode: GraphMode.geo,
}

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot(reducers, {
      metaReducers: metaReducers,
      initialState: initialState,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
    }),
    CommonModule,
  ],
})
export class AppStoreModule {}
