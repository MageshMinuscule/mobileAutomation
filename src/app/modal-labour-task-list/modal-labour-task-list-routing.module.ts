import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalLabourTaskListPage } from './modal-labour-task-list.page';

const routes: Routes = [
  {
    path: '',
    component: ModalLabourTaskListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalLabourTaskListPageRoutingModule {}
