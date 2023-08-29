import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TextAreaPage } from './text-area.page';

const routes: Routes = [
  {
    path: '',
    component: TextAreaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TextAreaPageRoutingModule {}
