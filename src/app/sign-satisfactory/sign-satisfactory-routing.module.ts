import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignSatisfactoryPage } from './sign-satisfactory.page';

const routes: Routes = [
  {
    path: '',
    component: SignSatisfactoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignSatisfactoryPageRoutingModule {}
