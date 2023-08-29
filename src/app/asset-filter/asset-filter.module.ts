import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetFilterPageRoutingModule } from './asset-filter-routing.module';

import { AssetFilterPage } from './asset-filter.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetFilterPageRoutingModule,
    TranslateModule
  ],
  declarations: [AssetFilterPage]
})
export class AssetFilterPageModule {}
