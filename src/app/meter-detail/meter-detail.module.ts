import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeterDetailPageRoutingModule } from './meter-detail-routing.module';

import { MeterDetailPage } from './meter-detail.page';
import { NgPipesModule } from 'ngx-pipes';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgPipesModule,
    TranslateModule,
    MeterDetailPageRoutingModule
  ],
  declarations: [MeterDetailPage]
})
export class MeterDetailPageModule {}
