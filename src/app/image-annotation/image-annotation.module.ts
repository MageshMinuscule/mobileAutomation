import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageAnnotationPageRoutingModule } from './image-annotation-routing.module';

import { ImageAnnotationPage } from './image-annotation.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageAnnotationPageRoutingModule,
    TranslateModule
  ],
  declarations: [ImageAnnotationPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports :[ImageAnnotationPage],
})
export class ImageAnnotationPageModule {}
