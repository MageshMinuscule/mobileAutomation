import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestDetailPageRoutingModule } from './request-detail-routing.module';

import { RequestDetailPage } from './request-detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { WorkDetailPage } from '../work-detail/work-detail.page';
import { WorkDetailPageModule } from '../work-detail/work-detail.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestDetailPageRoutingModule,
    TranslateModule,
    WorkDetailPageModule
    
  ],
  declarations: [RequestDetailPage ],
  schemas :[CUSTOM_ELEMENTS_SCHEMA]
})
export class RequestDetailPageModule {}
