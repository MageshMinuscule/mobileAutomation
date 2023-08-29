import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FaceIdPage } from './face-id.page';

const routes: Routes = [
  {
    path: '',
    component: FaceIdPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaceIdPageRoutingModule {}
