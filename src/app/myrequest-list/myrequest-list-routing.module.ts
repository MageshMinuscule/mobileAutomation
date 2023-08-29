import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyrequestListPage } from './myrequest-list.page';

const routes: Routes = [
  {
    path: '',
    component: MyrequestListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class MyrequestListPageRoutingModule {}
