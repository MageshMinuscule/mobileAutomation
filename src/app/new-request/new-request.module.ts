import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewRequestPageRoutingModule } from './new-request-routing.module';

import { NewRequestPage } from './new-request.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgObjectPipesModule} from 'ngx-pipes';
import { TemplateRenderPage } from '../template-render/template-render.page';
import { TemplateRenderPageModule } from '../template-render/template-render.module';
import { StopWatchPageModule } from '../stop-watch/stop-watch.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewRequestPageRoutingModule,
    TranslateModule,
    NgObjectPipesModule,
    TemplateRenderPageModule,
    StopWatchPageModule

  ],
  declarations: [NewRequestPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewRequestPageModule {}
