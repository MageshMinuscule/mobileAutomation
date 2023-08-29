import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StopWatchPage } from './stop-watch.page';

const routes: Routes = [
  {
    path: '',
    component: StopWatchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StopWatchPageRoutingModule {}
