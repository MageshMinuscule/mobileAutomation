import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DropdownPageRoutingModule } from './dropdown-routing.module';

import { DropdownPage } from './dropdown.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DropdownPageRoutingModule,
    TranslateModule
  ],
  declarations: [DropdownPage],
  schemas :[CUSTOM_ELEMENTS_SCHEMA],
  exports: [DropdownPage]
})
export class DropdownPageModule {}
