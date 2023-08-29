import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendingRequestListPageRoutingModule } from './pending-request-list-routing.module';

import { PendingRequestListPage } from './pending-request-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingRequestListPageRoutingModule,
    TranslateModule
  ],
  declarations: [PendingRequestListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports :[PendingRequestListPage]
})
export class PendingRequestListPageModule {}
