import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkDetailPageRoutingModule } from './work-detail-routing.module';

import { WorkDetailPage } from './work-detail.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkDetailPageRoutingModule,
    TranslateModule
  ],
  declarations: [WorkDetailPage],
  exports :[WorkDetailPage],
  schemas :[CUSTOM_ELEMENTS_SCHEMA]
})
export class WorkDetailPageModule {}
