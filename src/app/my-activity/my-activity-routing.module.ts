import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyActivityPage } from './my-activity.page';

const routes: Routes = [
  {
    path: '',
    component: MyActivityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyActivityPageRoutingModule {}
