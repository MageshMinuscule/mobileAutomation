import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuditPFPage } from './audit-pf.page';

const routes: Routes = [
  {
    path: '',
    component: AuditPFPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditPFPageRoutingModule {}
