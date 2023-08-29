import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DomainPage } from './domain.page';

const routes: Routes = [
  {
    path: '',
    component: DomainPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DomainPageRoutingModule {}
