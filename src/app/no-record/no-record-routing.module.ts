import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NoRecordPage } from './no-record.page';

const routes: Routes = [
  {
    path: '',
    component: NoRecordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoRecordPageRoutingModule {}
