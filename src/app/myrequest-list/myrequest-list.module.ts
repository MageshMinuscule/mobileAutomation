import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyrequestListPageRoutingModule } from './myrequest-list-routing.module';

import { MyrequestListPage } from './myrequest-list.page';
import { NgPipesModule } from 'ngx-pipes';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyrequestListPageRoutingModule,
    NgPipesModule,
    TranslateModule
  ],
  declarations: [MyrequestListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [MyrequestListPage]
})
export class MyrequestListPageModule {}
