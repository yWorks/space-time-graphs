import { Injectable, OnInit } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import * as _ from 'lodash'
import { environment } from '../../environments/environment'

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
    // 'Authorization': 'my-auth-token'
  })
}

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit {
  private _address: string

  constructor(private http: HttpClient) {
    this._address = environment.serverAddress
  }

  someData(): Observable<any[]> {
    return this.http.get(`assets/data/SomeData.json`, httpOptions).pipe(
      catchError(this.handleError),
      map((d: any) => {
        if (_.isNil(d)) {
          return null
        }
        return d
      })
    )
  }

  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message)
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`)
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.')
  }

  ngOnInit(): void {}
}
