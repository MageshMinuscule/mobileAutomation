import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkUpdatePageRoutingModule } from './work-update-routing.module';

import { WorkUpdatePage } from './work-update.page';
import { TranslateModule } from '@ngx-translate/core';
import { TemplateRenderPage } from '../template-render/template-render.page';
import { TemplateRenderPageModule } from '../template-render/template-render.module';
import { StopWatchPage } from '../stop-watch/stop-watch.page';
import { StopWatchPageModule } from '../stop-watch/stop-watch.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkUpdatePageRoutingModule,
    TranslateModule,
    TemplateRenderPageModule,
    StopWatchPageModule
  ],
  declarations: [WorkUpdatePage],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class WorkUpdatePageModule {}
