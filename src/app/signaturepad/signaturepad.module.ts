import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignaturepadPageRoutingModule } from './signaturepad-routing.module';

import { SignaturepadPage } from './signaturepad.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignaturepadPageRoutingModule,
    TranslateModule,
  ],
  declarations: [SignaturepadPage],
  schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class SignaturepadPageModule {}
