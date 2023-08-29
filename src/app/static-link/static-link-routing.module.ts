import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaticLinkPage } from './static-link.page';

const routes: Routes = [
  {
    path: '',
    component: StaticLinkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaticLinkPageRoutingModule {}
