import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HyperLinkPage } from './hyper-link.page';

const routes: Routes = [
  {
    path: '',
    component: HyperLinkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HyperLinkPageRoutingModule {}
