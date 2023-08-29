import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImagesPageRoutingModule } from './images-routing.module';

import { ImagesPage } from './images.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImagesPageRoutingModule,
    TranslateModule
  ],
  declarations: [ImagesPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ImagesPage],
})
export class ImagesPageModule {}
