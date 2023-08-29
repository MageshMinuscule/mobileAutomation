import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from '../home/home.page';
import { SettingsPage } from '../settings/settings.page';
import { WorkRequestListPage } from '../work-request-list/work-request-list.page';
import { TabPage } from './tab';


const routes: Routes = [
  {
    path: 'tab',
    component: TabPage, 

    // children:[
    //   {
    //     path: 'home',
    //     component: HomePage,
    //     loadChildren: () => import('../home/home.module').then(m =>m.HomePageModule)
    //   },
    //   {
    //     path: 'settings',
    //     component: SettingsPage,
    //     loadChildren: () => import('../settings/settings.module').then(m =>m.SettingsPageModule)
    //   },
    //   {
    //     path: 'work-request-list',
    //     component: WorkRequestListPage,
    //     loadChildren: () => import('../work-request-list/work-request-list.module').then(m =>m.WorkRequestListPageModule)
    //   },
    //   {
    //     path: '',
    //     loadChildren: () => import('../home/home.module').then(m =>m.HomePageModule),
    //     redirectTo: 'home',
    //     pathMatch:'full'
    //   }
    // ]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabPageRoutingModule {}
