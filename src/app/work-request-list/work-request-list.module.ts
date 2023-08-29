import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkRequestListPageRoutingModule } from './work-request-list-routing.module';

import { WorkRequestListPage } from './work-request-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkRequestListPageRoutingModule, 
    TranslateModule
  ],
  declarations: [WorkRequestListPage]
})
export class WorkRequestListPageModule {}
