import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SatisfactoryPage } from './satisfactory.page';

const routes: Routes = [
  {
    path: '',
    component: SatisfactoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SatisfactoryPageRoutingModule {}
