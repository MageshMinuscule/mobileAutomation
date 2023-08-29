import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnnotatePageRoutingModule } from './annotate-routing.module';

import { AnnotatePage } from './annotate.page';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnnotatePageRoutingModule,
    BrowserModule 
  ],
  declarations: [AnnotatePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AnnotatePageModule {}
