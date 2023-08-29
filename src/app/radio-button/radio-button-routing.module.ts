import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RadioButtonPage } from './radio-button.page';

const routes: Routes = [
  {
    path: '',
    component: RadioButtonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RadioButtonPageRoutingModule {}
