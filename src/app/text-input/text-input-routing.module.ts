import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TextInputPage } from './text-input.page';

const routes: Routes = [
  {
    path: '',
    component: TextInputPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TextInputPageRoutingModule {}
