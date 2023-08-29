import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportEmailPage } from './report-email.page';

const routes: Routes = [
  {
    path: '',
    component: ReportEmailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportEmailPageRoutingModule {}
