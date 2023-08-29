import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { SignUpPage } from './signup.page';
import { TranslateModule } from '@ngx-translate/core';
import { SignUpPageRoutingModule } from './signup-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignUpPageRoutingModule,
    TranslateModule,
  ],
  declarations: [SignUpPage]
})
export class SignUpPageModule {}
