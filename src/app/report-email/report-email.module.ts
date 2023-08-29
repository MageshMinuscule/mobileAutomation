import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportEmailPageRoutingModule } from './report-email-routing.module';

import { ReportEmailPage } from './report-email.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportEmailPageRoutingModule,
    TranslateModule
  ],
  declarations: [ReportEmailPage]
})
export class ReportEmailPageModule {}
