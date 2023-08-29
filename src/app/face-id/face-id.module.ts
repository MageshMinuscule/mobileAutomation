import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FaceIdPageRoutingModule } from './face-id-routing.module';

import { FaceIdPage } from './face-id.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FaceIdPageRoutingModule
  ],
  declarations: [FaceIdPage]
})
export class FaceIdPageModule {}
