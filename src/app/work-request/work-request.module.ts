import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkRequestPageRoutingModule } from './work-request-routing.module';

import { WorkRequestPage } from './work-request.page';
import { TranslateModule } from '@ngx-translate/core';
import { ImageAnnotationPage } from '../image-annotation/image-annotation.page';
import { ImageAnnotationPageModule } from '../image-annotation/image-annotation.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkRequestPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule ,
    ImageAnnotationPageModule
  ],
  declarations: [WorkRequestPage],
  schemas :[CUSTOM_ELEMENTS_SCHEMA]
})
export class WorkRequestPageModule {}
