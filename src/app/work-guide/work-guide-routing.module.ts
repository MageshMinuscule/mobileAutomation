import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkGuidePage } from './work-guide.page';

const routes: Routes = [
  {
    path: '',
    component: WorkGuidePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkGuidePageRoutingModule {}
