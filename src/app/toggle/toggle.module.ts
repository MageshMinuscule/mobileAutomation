import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TogglePageRoutingModule } from './toggle-routing.module';

import { TogglePage } from './toggle.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TogglePageRoutingModule,
    TranslateModule
  ],
  declarations: [TogglePage],
  schemas :[CUSTOM_ELEMENTS_SCHEMA],
  exports: [TogglePage]
})
export class TogglePageModule {}
