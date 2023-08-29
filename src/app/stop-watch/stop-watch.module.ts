import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StopWatchPageRoutingModule } from './stop-watch-routing.module';

import { StopWatchPage } from './stop-watch.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StopWatchPageRoutingModule
  ],
  declarations: [StopWatchPage],
  exports:[StopWatchPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class StopWatchPageModule {}
