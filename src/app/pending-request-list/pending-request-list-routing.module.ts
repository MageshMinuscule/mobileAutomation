import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingRequestListPage } from './pending-request-list.page';

const routes: Routes = [
  {
    path: '',
    component: PendingRequestListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingRequestListPageRoutingModule {}
