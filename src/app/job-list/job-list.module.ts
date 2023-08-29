import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobListPageRoutingModule } from './job-list-routing.module';

import { JobListPage } from './job-list.page';
import { JobsListPageModule } from '../jobs-list/jobs-list.module';
import { NoRecordPageModule } from '../no-record/no-record.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobListPageRoutingModule,
    JobsListPageModule,
    NoRecordPageModule,
    TranslateModule
  ],
  declarations: [ JobListPage ],
  schemas :[CUSTOM_ELEMENTS_SCHEMA]
})
export class JobListPageModule {}
