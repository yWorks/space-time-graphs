import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component'

import { AppStoreModule } from './store/app.store.module'
import { EffectsModule } from '@ngrx/effects'

import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  MatBadgeModule,
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatTableModule
} from '@angular/material'
import { SafePipe } from './safe.pipe'
import { MainViewComponent } from './views/main/mainview.component'
import { PropertyPanelComponent } from './propertypanel/propertypanel.component'
import { MainComponent } from './main/main.component'
import { LoadDataEffects } from './store/effects'
import { AboutDialogComponent } from './main/aboutdialog/aboutdialog.component'

@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    PropertyPanelComponent,
    MainComponent,
    SafePipe,
    AboutDialogComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    AppStoreModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatBadgeModule,
    EffectsModule.forRoot([LoadDataEffects]),
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AboutDialogComponent]
})
export class AppModule {}
