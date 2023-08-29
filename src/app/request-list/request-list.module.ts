import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestListPageRoutingModule } from './request-list-routing.module';

import { RequestListPage } from './request-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { MyrequestListPageModule } from '../myrequest-list/myrequest-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestListPageRoutingModule,
    TranslateModule,
    MyrequestListPageModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [RequestListPage]
})
export class RequestListPageModule {}
