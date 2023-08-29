import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignaturepadPage } from './signaturepad.page';

const routes: Routes = [
  {
    path: '',
    component: SignaturepadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignaturepadPageRoutingModule {}
