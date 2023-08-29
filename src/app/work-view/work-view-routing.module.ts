import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkViewPage } from './work-view.page';

const routes: Routes = [
  {
    path: '',
    component: WorkViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkViewPageRoutingModule {}
