import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TextAreaPageRoutingModule } from './text-area-routing.module';

import { TextAreaPage } from './text-area.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextAreaPageRoutingModule,
    TranslateModule
  ],
  declarations: [TextAreaPage],
  schemas : [CUSTOM_ELEMENTS_SCHEMA],
  exports:[TextAreaPage]
})
export class TextAreaPageModule {}
