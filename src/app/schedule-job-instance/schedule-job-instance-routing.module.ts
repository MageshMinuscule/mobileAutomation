import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScheduleJobInstancePage } from './schedule-job-instance.page';

const routes: Routes = [
  {
    path: '',
    component: ScheduleJobInstancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleJobInstancePageRoutingModule {}
