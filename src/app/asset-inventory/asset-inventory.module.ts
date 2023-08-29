import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetInventoryPageRoutingModule } from './asset-inventory-routing.module';

import { AssetInventoryPage } from './asset-inventory.page';
import { TranslateModule } from '@ngx-translate/core';
import { NoRecordPage } from '../no-record/no-record.page';
import { NoRecordPageModule } from '../no-record/no-record.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetInventoryPageRoutingModule,
    TranslateModule,
    NoRecordPageModule
  ],
  declarations: [AssetInventoryPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AssetInventoryPageModule {}
