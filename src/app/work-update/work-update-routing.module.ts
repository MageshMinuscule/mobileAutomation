import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkUpdatePage } from './work-update.page';

const routes: Routes = [
  {
    path: '',
    component: WorkUpdatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkUpdatePageRoutingModule {}
