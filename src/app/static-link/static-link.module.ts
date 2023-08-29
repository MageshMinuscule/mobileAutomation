import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaticLinkPageRoutingModule } from './static-link-routing.module';

import { StaticLinkPage } from './static-link.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaticLinkPageRoutingModule,
    TranslateModule
  ],
  declarations: [StaticLinkPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  exports: [StaticLinkPage]
})
export class StaticLinkPageModule {}
