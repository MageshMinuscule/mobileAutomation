import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkRequestViewPage } from './work-request-view.page';

const routes: Routes = [
  {
    path: '',
    component: WorkRequestViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkRequestViewPageRoutingModule {}
