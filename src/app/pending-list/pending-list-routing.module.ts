import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingListPage } from './pending-list.page';

const routes: Routes = [
  {
    path: '',
    component: PendingListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingListPageRoutingModule {}
