import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkRequestViewPageRoutingModule } from './work-request-view-routing.module';

import { WorkRequestViewPage } from './work-request-view.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkRequestViewPageRoutingModule,
    TranslateModule
  ],
  declarations: [WorkRequestViewPage]
})
export class WorkRequestViewPageModule {}
