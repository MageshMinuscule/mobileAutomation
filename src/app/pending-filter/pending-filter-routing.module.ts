import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingFilterPage } from './pending-filter.page';

const routes: Routes = [
  {
    path: '',
    component: PendingFilterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingFilterPageRoutingModule {}
