import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransportDetailPageRoutingModule } from './transport-detail-routing.module';

import { TransportDetailPage } from './transport-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransportDetailPageRoutingModule
  ],
  declarations: [TransportDetailPage]
})
export class TransportDetailPageModule {}
