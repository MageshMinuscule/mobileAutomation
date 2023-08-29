import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetInventoryPage } from './asset-inventory.page';

const routes: Routes = [
  {
    path: '',
    component: AssetInventoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetInventoryPageRoutingModule {}
