import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetTransferPageRoutingModule } from './asset-transfer-routing.module';

import { AssetTransferPage } from './asset-transfer.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetTransferPageRoutingModule,
    TranslateModule
  ],
  declarations: [AssetTransferPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  
})
export class AssetTransferPageModule {}
