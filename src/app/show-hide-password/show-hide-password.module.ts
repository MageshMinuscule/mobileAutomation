import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowHidePasswordPageRoutingModule } from './show-hide-password-routing.module';

import { ShowHidePasswordPage } from './show-hide-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule ,
    IonicModule,
    ShowHidePasswordPageRoutingModule
  ],
  declarations: [ShowHidePasswordPage],
  exports: [ShowHidePasswordPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ShowHidePasswordPageModule {}
