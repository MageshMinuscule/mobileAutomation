import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalLabourTaskListPageRoutingModule } from './modal-labour-task-list-routing.module';

import { ModalLabourTaskListPage } from './modal-labour-task-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalLabourTaskListPageRoutingModule
  ],
  declarations: [ModalLabourTaskListPage]
})
export class ModalLabourTaskListPageModule {}
