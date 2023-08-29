import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendingListPageRoutingModule } from './pending-list-routing.module';

import { PendingListPage } from './pending-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { PendingRequestListPageModule } from '../pending-request-list/pending-request-list.module';
import { NoRecordPageModule } from '../no-record/no-record.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PendingListPageRoutingModule,
    TranslateModule,
    PendingRequestListPageModule,
    NoRecordPageModule
  ],
  declarations: [PendingListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PendingListPageModule {}
