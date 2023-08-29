import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatetimePageRoutingModule } from './datetime-routing.module';

import { DatetimePage } from './datetime.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatetimePageRoutingModule,
    TranslateModule
  ],
  declarations: [DatetimePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [DatetimePage]
})
export class DatetimePageModule {}
