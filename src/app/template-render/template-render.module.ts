import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TemplateRenderPageRoutingModule } from './template-render-routing.module';

import { TemplateRenderPage } from './template-render.page';
import { TextAreaPage } from '../text-area/text-area.page';
import { TextInputPage } from '../text-input/text-input.page';
import { TablePage } from '../table/table.page';
import { StaticLinkPage } from '../static-link/static-link.page';
import { TogglePage } from '../toggle/toggle.page';
import { ToggleReasonPage } from '../toggle-reason/toggle-reason.page';
import { VideoPage } from '../video/video.page';
import { SignSatisfactoryPage } from '../sign-satisfactory/sign-satisfactory.page';
import { SignaturePage } from '../signature/signature.page';
import { SatisfactoryPage } from '../satisfactory/satisfactory.page';
import { NumberInputPage } from '../number-input/number-input.page';
import { HyperLinkPage } from '../hyper-link/hyper-link.page';
import { CheckboxViewPage } from '../checkbox-view/checkbox-view.page';
import { DropdownPage } from '../dropdown/dropdown.page';
import { RadioButtonPage } from '../radio-button/radio-button.page';
import { ImageAnnotationPage } from '../image-annotation/image-annotation.page';
import { DatetimePage } from '../datetime/datetime.page';
import { KeysPipe } from '../pipes/keys.pipe';
import { ButtonPageModule } from '../button/button.module';
import { CheckboxViewPageModule } from '../checkbox-view/checkbox-view.module';
import { DatetimePageModule } from '../datetime/datetime.module';
import { DropdownPageModule } from '../dropdown/dropdown.module';
import { TogglePageModule } from '../toggle/toggle.module';
import { StaticLinkPageModule } from '../static-link/static-link.module';
import { TextAreaPageModule } from '../text-area/text-area.module';
import { TextInputPageModule } from '../text-input/text-input.module';
import { HyperLinkPageModule } from '../hyper-link/hyper-link.module';
import { NumberInputPageModule } from '../number-input/number-input.module';
import { RadioButtonPageModule } from '../radio-button/radio-button.module';
import { ImageAnnotationPageModule } from '../image-annotation/image-annotation.module';
import { TablePageModule } from '../table/table.module';
import { SignSatisfactoryPageModule } from '../sign-satisfactory/sign-satisfactory.module';
import { SignaturePageModule } from '../signature/signature.module';
import { SatisfactoryPageModule } from '../satisfactory/satisfactory.module';
import { ToggleReasonPageModule } from '../toggle-reason/toggle-reason.module';
import { VideoPageModule } from '../video/video.module';
import { KeysPipeModule } from '../pipes/keys.pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { AuditPageModule } from '../audit/audit.module';
import { AuditPFPageModule } from '../audit-pf/audit-pf.module';
import { ImagesPageModule } from '../images/images.module';





@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TemplateRenderPageRoutingModule,
    ButtonPageModule,
    CheckboxViewPageModule,
    DatetimePageModule,
    DropdownPageModule,
    TogglePageModule,
    StaticLinkPageModule,
    TextAreaPageModule,
    TextInputPageModule,
    HyperLinkPageModule,
    NumberInputPageModule,
    RadioButtonPageModule,
    ImageAnnotationPageModule,
    TablePageModule,
    SignSatisfactoryPageModule,
    SignaturePageModule,
    SatisfactoryPageModule,
    ToggleReasonPageModule,
    VideoPageModule,
    KeysPipeModule,
    TranslateModule,
    AuditPageModule,
    AuditPFPageModule,
    ImagesPageModule
  ],
  declarations: [TemplateRenderPage,
],
  exports: [TemplateRenderPage, KeysPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class TemplateRenderPageModule {}
