import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkViewPageRoutingModule } from './work-view-routing.module';

import { WorkViewPage } from './work-view.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgPipesModule } from 'ngx-pipes';
import { KeysPipe } from '../pipes/keys.pipe';
import { KeysPipeModule } from '../pipes/keys.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkViewPageRoutingModule,
    TranslateModule,
    NgPipesModule,
    KeysPipeModule
    
  ],
  declarations: [WorkViewPage],
  exports: [KeysPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WorkViewPageModule {}
