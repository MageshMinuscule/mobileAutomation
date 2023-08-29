import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ButtonPageRoutingModule } from './button-routing.module';

import { ButtonPage } from './button.page';
import { TranslateModule } from '@ngx-translate/core';
import { MyrequestListPage } from '../myrequest-list/myrequest-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ButtonPageRoutingModule,
    TranslateModule
  ],
  declarations: [ButtonPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ButtonPage]
})
export class ButtonPageModule {}
