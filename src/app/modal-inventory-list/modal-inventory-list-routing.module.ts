import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalInventoryListPage } from './modal-inventory-list.page';

const routes: Routes = [
  {
    path: '',
    component: ModalInventoryListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalInventoryListPageRoutingModule {}
