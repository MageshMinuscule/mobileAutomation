import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnnotatePage } from './annotate.page';

const routes: Routes = [
  {
    path: '',
    component: AnnotatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnnotatePageRoutingModule {}
