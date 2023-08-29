import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkHistoryPageRoutingModule } from './work-history-routing.module';

import { WorkHistoryPage } from './work-history.page';
import { JobsListPage } from '../jobs-list/jobs-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { NoRecordPage } from '../no-record/no-record.page';
import { JobsListPageModule } from '../jobs-list/jobs-list.module';
import { NoRecordPageModule } from '../no-record/no-record.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkHistoryPageRoutingModule,
    TranslateModule,
    JobsListPageModule,
    NoRecordPageModule
  ],
  declarations: [ WorkHistoryPage ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WorkHistoryPageModule {}
