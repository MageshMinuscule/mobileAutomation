import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAddPartsPage } from './modal-add-parts.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAddPartsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAddPartsPageRoutingModule {}
