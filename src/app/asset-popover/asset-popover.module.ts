import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AssetPopoverComponent } from './asset-popover.component';
import { AssetPopoverRoutingModule } from './asset-popover-routing.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetPopoverRoutingModule
  ],
  declarations: [AssetPopoverComponent]
})
export class AssetPopOverPageModule {}
