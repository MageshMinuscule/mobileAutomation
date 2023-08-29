import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckboxViewPage } from './checkbox-view.page';

const routes: Routes = [
  {
    path: '',
    component: CheckboxViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckboxViewPageRoutingModule {}
