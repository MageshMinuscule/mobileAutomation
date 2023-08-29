import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryListPageRoutingModule } from './inventory-list-routing.module';

import { InventoryListPage } from './inventory-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventoryListPageRoutingModule,
    TranslateModule
  ],
  declarations: [InventoryListPage]
})
export class InventoryListPageModule {}
