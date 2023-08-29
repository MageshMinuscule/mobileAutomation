import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditPageRoutingModule } from './audit-routing.module';

import { AuditPage } from './audit.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditPageRoutingModule,
    TranslateModule
  ],
  declarations: [AuditPage],
  exports: [AuditPage],
  schemas : [CUSTOM_ELEMENTS_SCHEMA],
  
})
export class AuditPageModule {}
