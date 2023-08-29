import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NumberInputPageRoutingModule } from './number-input-routing.module';

import { NumberInputPage } from './number-input.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NumberInputPageRoutingModule,
    TranslateModule
  ],
  declarations: [NumberInputPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [NumberInputPage]
})
export class NumberInputPageModule {}
