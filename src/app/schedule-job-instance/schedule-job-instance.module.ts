import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScheduleJobInstancePageRoutingModule } from './schedule-job-instance-routing.module';

import { ScheduleJobInstancePage } from './schedule-job-instance.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScheduleJobInstancePageRoutingModule,
    TranslateModule
  ],
  declarations: [ScheduleJobInstancePage]
})
export class ScheduleJobInstancePageModule {}
