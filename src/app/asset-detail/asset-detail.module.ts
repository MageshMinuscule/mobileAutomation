import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetDetailPageRoutingModule } from './asset-detail-routing.module';

import { AssetDetailPage } from './asset-detail.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetDetailPageRoutingModule,
    TranslateModule
  ],
  declarations: [AssetDetailPage]
})
export class AssetDetailPageModule {}
