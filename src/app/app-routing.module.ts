import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import { HomePage } from './home/home.page';
const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./tab/tab.module').then(m => m.TabPageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule)
  },
  {
    path: 'schedule-job-instance',
    loadChildren: () => import('./schedule-job-instance/schedule-job-instance.module').then( m => m.ScheduleJobInstancePageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'inventory-list',
    loadChildren: () => import('./inventory-list/inventory-list.module').then( m => m.InventoryListPageModule)
  },
  {
    path: 'asset-list',
    loadChildren: () => import('./asset-list/asset-list.module').then( m => m.AssetListPageModule)
  },
  {
    path: 'inventory-detail',
    loadChildren: () => import('./inventory-detail/inventory-detail.module').then( m => m.InventoryDetailPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'asset-detail',
    loadChildren: () => import('./asset-detail/asset-detail.module').then( m => m.AssetDetailPageModule)
  },
  {
    path: 'request-list',
    loadChildren: () => import('./request-list/request-list.module').then( m => m.RequestListPageModule)
  },
  {
    path: 'myrequest-list',
    loadChildren: () => import('./myrequest-list/myrequest-list.module').then( m => m.MyrequestListPageModule)
  },
  {
    path: 'job-list',
    loadChildren: () => import('./job-list/job-list.module').then( m => m.JobListPageModule)
  },
  {
    path: 'no-record',
    loadChildren: () => import('./no-record/no-record.module').then( m => m.NoRecordPageModule)
  },
  {
    path: 'jobs-list',
    loadChildren: () => import('./jobs-list/jobs-list.module').then( m => m.JobsListPageModule)
  },
  {
    path: 'pending-list',
    loadChildren: () => import('./pending-list/pending-list.module').then( m => m.PendingListPageModule)
  },
  {
    path: 'pending-request-list',
    loadChildren: () => import('./pending-request-list/pending-request-list.module').then( m => m.PendingRequestListPageModule)
  },
  {
    path: 'request-detail',
    loadChildren: () => import('./request-detail/request-detail.module').then( m => m.RequestDetailPageModule)
  },
  {
    path: 'work-detail',
    loadChildren: () => import('./work-detail/work-detail.module').then( m => m.WorkDetailPageModule)
  },
  {
    path: 'work-request-list',
    loadChildren: () => import('./work-request-list/work-request-list.module').then( m => m.WorkRequestListPageModule)
  },
  {
    path: 'work-request-view',
    loadChildren: () => import('./work-request-view/work-request-view.module').then( m => m.WorkRequestViewPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'asset-filter',
    loadChildren: () => import('./asset-filter/asset-filter.module').then( m => m.AssetFilterPageModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
  },
  {
    path: 'customer',
    loadChildren: () => import('./customer/customer.module').then( m => m.CustomerPageModule)
  },
  {
    path: 'work-request',
    loadChildren: () => import('./work-request/work-request.module').then( m => m.WorkRequestPageModule)
  },
  {
    path: 'image-annotation',
    loadChildren: () => import('./image-annotation/image-annotation.module').then( m => m.ImageAnnotationPageModule)
  },
  {
    path: 'annotate',
    loadChildren: () => import('./annotate/annotate.module').then( m => m.AnnotatePageModule)
  },
  {
    path: 'new-request',
    loadChildren: () => import('./new-request/new-request.module').then( m => m.NewRequestPageModule)
  },
  {
    path: 'text-area',
    loadChildren: () => import('./text-area/text-area.module').then( m => m.TextAreaPageModule)
  },
  {
    path: 'text-input',
    loadChildren: () => import('./text-input/text-input.module').then( m => m.TextInputPageModule)
  },
  {
    path: 'hyper-link',
    loadChildren: () => import('./hyper-link/hyper-link.module').then( m => m.HyperLinkPageModule)
  },
  {
    path: 'static-link',
    loadChildren: () => import('./static-link/static-link.module').then( m => m.StaticLinkPageModule)
  },
  {
    path: 'number-input',
    loadChildren: () => import('./number-input/number-input.module').then( m => m.NumberInputPageModule)
  },
  {
    path: 'radio-button',
    loadChildren: () => import('./radio-button/radio-button.module').then( m => m.RadioButtonPageModule)
  },
  {
    path: 'dropdown',
    loadChildren: () => import('./dropdown/dropdown.module').then( m => m.DropdownPageModule)
  },
  {
    path: 'checkbox-view',
    loadChildren: () => import('./checkbox-view/checkbox-view.module').then( m => m.CheckboxViewPageModule)
  },
  {
    path: 'table',
    loadChildren: () => import('./table/table.module').then( m => m.TablePageModule)
  },
  {
    path: 'sign-satisfactory',
    loadChildren: () => import('./sign-satisfactory/sign-satisfactory.module').then( m => m.SignSatisfactoryPageModule)
  },
  {
    path: 'signature',
    loadChildren: () => import('./signature/signature.module').then( m => m.SignaturePageModule)
  },
  {
    path: 'satisfactory',
    loadChildren: () => import('./satisfactory/satisfactory.module').then( m => m.SatisfactoryPageModule)
  },
  {
    path: 'toggle',
    loadChildren: () => import('./toggle/toggle.module').then( m => m.TogglePageModule)
  },
  {
    path: 'toggle-reason',
    loadChildren: () => import('./toggle-reason/toggle-reason.module').then( m => m.ToggleReasonPageModule)
  },
  {
    path: 'video',
    loadChildren: () => import('./video/video.module').then( m => m.VideoPageModule)
  },
  {
    path: 'datetime',
    loadChildren: () => import('./datetime/datetime.module').then( m => m.DatetimePageModule)
  },
  {
    path: 'work-view',
    loadChildren: () => import('./work-view/work-view.module').then( m => m.WorkViewPageModule)
  },
  {
    path: 'work-history',
    loadChildren: () => import('./work-history/work-history.module').then( m => m.WorkHistoryPageModule)
  },
  {
    path: 'attachment',
    loadChildren: () => import('./attachment/attachment.module').then( m => m.AttachmentPageModule)
  },
  {
    path: 'button',
    loadChildren: () => import('./button/button.module').then( m => m.ButtonPageModule)
  },
  {
    path: 'work-update',
    loadChildren: () => import('./work-update/work-update.module').then( m => m.WorkUpdatePageModule)
  },
  {
    path: 'report-email',
    loadChildren: () => import('./report-email/report-email.module').then( m => m.ReportEmailPageModule)
  },
  {
    path: 'user-list',
    loadChildren: () => import('./user-list/user-list.module').then( m => m.UserListPageModule)
  },
  {
    path: 'labour-tasks-list',
    loadChildren: () => import('./labour-tasks-list/labour-tasks-list.module').then( m => m.LabourTasksListPageModule)
  },
  {
    path: 'labour-task-detail',
    loadChildren: () => import('./labour-task-detail/labour-task-detail.module').then( m => m.LabourTaskDetailPageModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./contact/contact.module').then( m => m.ContactPageModule)
  },
  {
    path: 'asset',
    loadChildren: () => import('./asset/asset.module').then( m => m.AssetPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'template-render',
    loadChildren: () => import('./template-render/template-render.module').then( m => m.TemplateRenderPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'signaturepad',
    loadChildren: () => import('./signaturepad/signaturepad.module').then( m => m.SignaturepadPageModule)
  },
  {
    path: 'checkin',
    loadChildren: () => import('./checkin/checkin.module').then( m => m.CheckinPageModule)
  },
  {
    path: 'attendance',
    loadChildren: () => import('./attendance/attendance.module').then( m => m.AttendancePageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'schedule-demo',
    loadChildren: () => import('./schedule-demo/schedule-demo.module').then( m => m.ScheduleDemoPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignUpPageModule)
  },
  {
    path: 'view-image',
    loadChildren: () => import('./view-image/view-image.module').then( m => m.ViewImagePageModule)
  },
  {
    path: 'domain',
    loadChildren: () => import('./domain/domain.module').then( m => m.DomainPageModule)
  },
  {
    path: 'asset-inventory',
    loadChildren: () => import('./asset-inventory/asset-inventory.module').then( m => m.AssetInventoryPageModule)
  },
  {
    path: 'video-player',
    loadChildren: () => import('./video-player/video-player.module').then( m => m.VideoPlayerPageModule)
  },
  {
    path: 'location',
    loadChildren: () => import('./location/location.module').then( m => m.LocationPageModule)
  },
  {
    path: 'track-user',
    loadChildren: () => import('./track-user/track-user.module').then( m => m.TrackUserPageModule)
  },
  {
    path: 'transport-detail',
    loadChildren: () => import('./transport-detail/transport-detail.module').then( m => m.TransportDetailPageModule)
  },
  {
    path: 'checkbox',
    loadChildren: () => import('./checkbox/checkbox.module').then( m => m.CheckboxPageModule)
  },
  {
    path: 'popover',
    loadChildren: () => import('./popover/popover.module').then( m => m.PopoverPageModule)
  },
  {
    path: 'assetdowntime',
    loadChildren: () => import('./assetdowntime/assetdowntime.module').then( m => m.AssetdowntimePageModule)
  },
  {
    path: 'meter-reading',
    loadChildren: () => import('./meter-reading/meter-reading.module').then( m => m.MeterReadingPageModule)
  },
  {
    path: 'meter-detail',
    loadChildren: () => import('./meter-detail/meter-detail.module').then( m => m.MeterDetailPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'track',
    loadChildren: () => import('./track/track.module').then( m => m.TrackPageModule)
  },
  {
    path: 'pending-filter',
    loadChildren: () => import('./pending-filter/pending-filter.module').then( m => m.PendingFilterPageModule)
  },
  {
    path: 'show-hide-password',
    loadChildren: () => import('./show-hide-password/show-hide-password.module').then( m => m.ShowHidePasswordPageModule)
  },
  {
    path: 'audit',
    loadChildren: () => import('./audit/audit.module').then( m => m.AuditPageModule)
  },
  {
    path: 'audit-pf',
    loadChildren: () => import('./audit-pf/audit-pf.module').then( m => m.AuditPFPageModule)
  },
  {
    path: 'face-id',
    loadChildren: () => import('./face-id/face-id.module').then( m => m.FaceIdPageModule)
  },
  {
    path: 'asset-popover',
    loadChildren: () => import('./asset-popover/asset-popover.module').then( m => m.AssetPopOverPageModule)
  },
  {
    path: 'asset-transfer',
    loadChildren: () => import('./asset-transfer/asset-transfer.module').then( m => m.AssetTransferPageModule)
  },   
  {
     path: 'my-activity',
  loadChildren: () => import('./my-activity/my-activity.module').then( m => m.MyActivityPageModule)
},  {
    path: 'stop-watch',
    loadChildren: () => import('./stop-watch/stop-watch.module').then( m => m.StopWatchPageModule)
  },
  {
    path: 'modal-view',
    loadChildren: () => import('./modal-view/modal-view.module').then( m => m.ModalViewPageModule)
  },
  {
    path: 'work-guide',
    loadChildren: () => import('./work-guide/work-guide.module').then( m => m.WorkGuidePageModule)
  },
  {
    path: 'modal-labour-task-list',
    loadChildren: () => import('./modal-labour-task-list/modal-labour-task-list.module').then( m => m.ModalLabourTaskListPageModule)
  },
  {
    path: 'modal-labour-task-detail',
    loadChildren: () => import('./modal-labour-task-detail/modal-labour-task-detail.module').then( m => m.ModalLabourTaskDetailPageModule)
  },
  {
    path: 'modal-inventory-list',
    loadChildren: () => import('./modal-inventory-list/modal-inventory-list.module').then( m => m.ModalInventoryListPageModule)
  },
  {
    path: 'modal-add-parts',
    loadChildren: () => import('./modal-add-parts/modal-add-parts.module').then( m => m.ModalAddPartsPageModule)
  }







];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{preloadingStrategy: PreloadAllModules}),
  ],
  exports: [RouterModule,TranslateModule]
})
export class AppRoutingModule { }
export const components = [
  HomePage
]
