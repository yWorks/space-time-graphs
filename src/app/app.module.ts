import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component'

import { AppStoreModule } from './store/app.store.module'
import { EffectsModule } from '@ngrx/effects'

import { HttpClientModule } from '@angular/common/http'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
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
