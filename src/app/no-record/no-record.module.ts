import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NoRecordPageRoutingModule } from './no-record-routing.module';

import { NoRecordPage } from './no-record.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoRecordPageRoutingModule,
    TranslateModule
  ],
  declarations: [NoRecordPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports :[NoRecordPage],
})
export class NoRecordPageModule {}
