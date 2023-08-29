import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditPFPageRoutingModule } from './audit-pf-routing.module';

import { AuditPFPage } from './audit-pf.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditPFPageRoutingModule
  ],
  declarations: [AuditPFPage],
  exports: [AuditPFPage],
  schemas : [CUSTOM_ELEMENTS_SCHEMA],

})
export class AuditPFPageModule {}
