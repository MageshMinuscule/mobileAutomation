import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HyperLinkPageRoutingModule } from './hyper-link-routing.module';

import { HyperLinkPage } from './hyper-link.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HyperLinkPageRoutingModule,
    TranslateModule
  ],
  declarations: [HyperLinkPage],
  schemas :[CUSTOM_ELEMENTS_SCHEMA],
  exports: [HyperLinkPage]
})
export class HyperLinkPageModule {}
