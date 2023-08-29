import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryDetailPageRoutingModule } from './inventory-detail-routing.module';

import { InventoryDetailPage } from './inventory-detail.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventoryDetailPageRoutingModule,
    TranslateModule
  ],
  declarations: [InventoryDetailPage]
})
export class InventoryDetailPageModule {}
