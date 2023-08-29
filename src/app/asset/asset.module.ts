import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetPageRoutingModule } from './asset-routing.module';

import { AssetPage } from './asset.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetPageRoutingModule,
    TranslateModule
  ],
  declarations: [AssetPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AssetPageModule {}
