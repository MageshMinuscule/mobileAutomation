import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackUserPageRoutingModule } from './track-user-routing.module';

import { TrackUserPage } from './track-user.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackUserPageRoutingModule,
    TranslateModule
  ],
  declarations: [TrackUserPage]
})
export class TrackUserPageModule {}
