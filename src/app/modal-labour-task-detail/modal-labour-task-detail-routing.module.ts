import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalLabourTaskDetailPage } from './modal-labour-task-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ModalLabourTaskDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalLabourTaskDetailPageRoutingModule {}
