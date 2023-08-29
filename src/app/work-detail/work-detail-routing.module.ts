import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkDetailPage } from './work-detail.page';

const routes: Routes = [
  {
    path: '',
    component: WorkDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkDetailPageRoutingModule {}
