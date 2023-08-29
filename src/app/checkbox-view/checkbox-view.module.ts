import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckboxViewPageRoutingModule } from './checkbox-view-routing.module';

import { CheckboxViewPage } from './checkbox-view.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckboxViewPageRoutingModule,
    TranslateModule
  ],
  declarations: [CheckboxViewPage],
  schemas :[CUSTOM_ELEMENTS_SCHEMA],
  exports:[CheckboxViewPage]
})
export class CheckboxViewPageModule {}
