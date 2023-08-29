import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkRequestListPage } from './work-request-list.page';

const routes: Routes = [
  {
    path: '',
    component: WorkRequestListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkRequestListPageRoutingModule {}
