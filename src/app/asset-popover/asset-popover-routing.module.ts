import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetPopoverComponent } from './asset-popover.component';


const routes: Routes = [
  {
    path: '',
    component: AssetPopoverComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetPopoverRoutingModule {}
