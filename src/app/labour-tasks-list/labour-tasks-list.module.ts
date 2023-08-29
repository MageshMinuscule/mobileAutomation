import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LabourTasksListPageRoutingModule } from './labour-tasks-list-routing.module';

import { LabourTasksListPage } from './labour-tasks-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { NoRecordPage } from '../no-record/no-record.page';
import { NoRecordPageModule } from '../no-record/no-record.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LabourTasksListPageRoutingModule,
    TranslateModule,
    NoRecordPageModule
  ],
  declarations: [LabourTasksListPage],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class LabourTasksListPageModule {}
