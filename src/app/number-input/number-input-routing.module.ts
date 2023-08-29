import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NumberInputPage } from './number-input.page';

const routes: Routes = [
  {
    path: '',
    component: NumberInputPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NumberInputPageRoutingModule {}
