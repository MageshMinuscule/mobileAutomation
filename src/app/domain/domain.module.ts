import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DomainPageRoutingModule } from './domain-routing.module';

import { DomainPage } from './domain.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DomainPageRoutingModule,
    TranslateModule
  ],
  declarations: [DomainPage]
})
export class DomainPageModule {}
