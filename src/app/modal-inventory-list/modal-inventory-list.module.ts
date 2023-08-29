import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalInventoryListPageRoutingModule } from './modal-inventory-list-routing.module';

import { ModalInventoryListPage } from './modal-inventory-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalInventoryListPageRoutingModule
  ],
  declarations: [ModalInventoryListPage]
})
export class ModalInventoryListPageModule {}
