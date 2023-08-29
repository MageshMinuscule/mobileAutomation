import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransportDetailPage } from './transport-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TransportDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransportDetailPageRoutingModule {}
