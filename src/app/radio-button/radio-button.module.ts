import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RadioButtonPageRoutingModule } from './radio-button-routing.module';

import { RadioButtonPage } from './radio-button.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RadioButtonPageRoutingModule,
    TranslateModule
  ],
  declarations: [RadioButtonPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [RadioButtonPage]
})
export class RadioButtonPageModule {}
