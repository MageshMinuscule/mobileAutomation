import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScheduleDemoPage } from './schedule-demo.page';

const routes: Routes = [
  {
    path: '',
    component: ScheduleDemoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleDemoPageRoutingModule {}
