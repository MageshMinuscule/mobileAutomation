import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkRequestPage } from './work-request.page';

const routes: Routes = [
  {
    path: '',
    component: WorkRequestPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkRequestPageRoutingModule {}
