import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetdowntimePage } from './assetdowntime.page';

const routes: Routes = [
  {
    path: '',
    component: AssetdowntimePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetdowntimePageRoutingModule {}
