import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserListPageRoutingModule } from './user-list-routing.module';

import { UserListPage } from './user-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { NoRecordPage } from '../no-record/no-record.page';
import { NoRecordPageModule } from '../no-record/no-record.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserListPageRoutingModule,
    TranslateModule,
    NoRecordPageModule
  ],
  declarations: [UserListPage],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class UserListPageModule {}
