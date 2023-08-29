import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkGuidePageRoutingModule } from './work-guide-routing.module';

import { WorkGuidePage } from './work-guide.page';
import { TranslateModule } from '@ngx-translate/core';
import { NoRecordPageModule } from '../no-record/no-record.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkGuidePageRoutingModule,
    TranslateModule,
    NoRecordPageModule
  ],
  declarations: [WorkGuidePage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA]
})
export class WorkGuidePageModule {}
