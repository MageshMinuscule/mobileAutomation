import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAddPartsPageRoutingModule } from './modal-add-parts-routing.module';

import { ModalAddPartsPage } from './modal-add-parts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalAddPartsPageRoutingModule
  ],
  declarations: [ModalAddPartsPage]
})
export class ModalAddPartsPageModule {}
