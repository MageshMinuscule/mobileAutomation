import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobsListPageRoutingModule } from './jobs-list-routing.module';

import { JobsListPage } from './jobs-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobsListPageRoutingModule,
    TranslateModule
  ],
  
  declarations: [JobsListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports :[JobsListPage],
})
export class JobsListPageModule {}
