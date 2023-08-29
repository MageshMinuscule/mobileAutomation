import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeterReadingPageRoutingModule } from './meter-reading-routing.module';

import { MeterReadingPage } from './meter-reading.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgPipesModule } from 'ngx-pipes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgPipesModule,
    TranslateModule,
    MeterReadingPageRoutingModule
  ],
  declarations: [MeterReadingPage]
})
export class MeterReadingPageModule {}
