import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ToggleReasonPageRoutingModule } from './toggle-reason-routing.module';

import { ToggleReasonPage } from './toggle-reason.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ToggleReasonPageRoutingModule,
    TranslateModule
  ],
  declarations: [ToggleReasonPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ToggleReasonPage]
})
export class ToggleReasonPageModule {}
