import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalLabourTaskDetailPageRoutingModule } from './modal-labour-task-detail-routing.module';

import { ModalLabourTaskDetailPage } from './modal-labour-task-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalLabourTaskDetailPageRoutingModule
  ],
  declarations: [ModalLabourTaskDetailPage]
})
export class ModalLabourTaskDetailPageModule {}
