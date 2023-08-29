import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeterDetailPage } from './meter-detail.page';

const routes: Routes = [
  {
    path: '',
    component: MeterDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeterDetailPageRoutingModule {}
