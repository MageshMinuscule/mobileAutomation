import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToggleReasonPage } from './toggle-reason.page';

const routes: Routes = [
  {
    path: '',
    component: ToggleReasonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToggleReasonPageRoutingModule {}
