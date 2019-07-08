import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MainViewComponent } from './views/main/mainview.component'

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  {
    path: 'main',
    component: MainViewComponent
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
