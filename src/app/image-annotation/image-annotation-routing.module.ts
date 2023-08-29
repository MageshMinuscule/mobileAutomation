import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImageAnnotationPage } from './image-annotation.page';

const routes: Routes = [
  {
    path: '',
    component: ImageAnnotationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageAnnotationPageRoutingModule {}
