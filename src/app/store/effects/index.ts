import { Injectable } from '@angular/core'
import { Actions, Effect, ofType } from '@ngrx/effects'
import { HttpClient } from '@angular/common/http'
import { switchMap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { StoreActionTypes } from '../actions/storeActions'
import { GraphActions } from '../actions'

import { DataService } from '../../services/data.service'
import { AddEdge, AddNode } from '../actions/graphActions'
import { EdgeData, NodeData } from '../../main/data/entities'

@Injectable()
export class LoadDataEffects {
  constructor(private data: DataService, private actions$: Actions, private http: HttpClient) {}

  @Effect()
  loadData$: Observable<GraphActions> = this.actions$.pipe(
    ofType(StoreActionTypes.Reset),

    switchMap((action) => {
      return this.data.someData().pipe(
        switchMap((diagramData) => {
          const blob = diagramData
          const list: any[] = []
          blob['nodes'].forEach((n) => list.push(new AddNode(new NodeData(n))))
          blob['edges'].forEach((e) => list.push(new AddEdge(new EdgeData(e))))
          return list
        })
      )
    })
  )
}
