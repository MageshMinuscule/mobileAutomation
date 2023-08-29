import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignSatisfactoryPageRoutingModule } from './sign-satisfactory-routing.module';

import { SignSatisfactoryPage } from './sign-satisfactory.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignSatisfactoryPageRoutingModule,
    TranslateModule
  ],
  declarations: [SignSatisfactoryPage ],
  schemas :[CUSTOM_ELEMENTS_SCHEMA],
  exports: [SignSatisfactoryPage]
})
export class SignSatisfactoryPageModule {}
