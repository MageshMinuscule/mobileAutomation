import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TextInputPageRoutingModule } from './text-input-routing.module';

import { TextInputPage } from './text-input.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextInputPageRoutingModule,
    TranslateModule
  ],
  declarations: [TextInputPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [TextInputPage]
})
export class TextInputPageModule {}
