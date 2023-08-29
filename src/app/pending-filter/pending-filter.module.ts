import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendingFilterPageRoutingModule } from './pending-filter-routing.module';

import { PendingFilterPage } from './pending-filter.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingFilterPageRoutingModule,
    TranslateModule
  ],
  declarations: [PendingFilterPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PendingFilterPageModule {}
