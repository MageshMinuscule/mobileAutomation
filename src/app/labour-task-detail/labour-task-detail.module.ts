import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LabourTaskDetailPageRoutingModule } from './labour-task-detail-routing.module';

import { LabourTaskDetailPage } from './labour-task-detail.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LabourTaskDetailPageRoutingModule,
    TranslateModule
  ],
  declarations: [LabourTaskDetailPage]
})
export class LabourTaskDetailPageModule {}
