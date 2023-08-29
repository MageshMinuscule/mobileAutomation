import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NgCalendarModule } from 'ionic2-calendar';
import { EventsPageModule } from './events/events.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { fireBaseConfig } from './config';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage-angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { TabPage } from './tab/tab';
import { CommonProvider } from './common/common';
import { CommonModule, DatePipe } from '@angular/common';
// Stauts bar && SplashScreen
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
//Globalization
import { Globalization } from '@ionic-native/globalization/ngx';
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
// register module
import { AppVersion } from '@ionic-native/app-version/ngx';
// geolocation and native-geocoder
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { Market } from '@ionic-native/market/ngx';
import { Events } from 'src/providers/events/events';
import { FirebaseAnalytics } from "@ionic-native/firebase-analytics/ngx";
import { OfflineProvider } from 'src/providers/offline/offline';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { TemplateProvider } from 'src/providers/template/template';
import { FirebaseProvider } from 'src/providers/firebase/firebase';
import { ButtonActionProvider } from 'src/providers/button-action/button-action';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
//mediaType
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { Media } from '@ionic-native/media/ngx';
//PhotoLibrary
 import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
//filetransfer
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import{ File } from '@ionic-native/file/ngx';
//AngularFire Module
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { HaversineService } from "ng2-haversine";
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { Device } from '@ionic-native/device/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Drivers } from '@ionic/storage';
// import {FileOpener} from '@ionic-native/file-opener/ngx';




export function HttpLoaderFactory(http: HttpClient) { return new TranslateHttpLoader(http, './assets/i18n/', '.json'); }

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: [Drivers.IndexedDB],
    }),
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(fireBaseConfig),
    AngularFirestoreModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgCalendarModule,
    EventsPageModule,
    TranslateModule,
    // ReactiveFormsModule,
    CommonModule

  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AngularFireAuth,
    AngularFirestore,
    AngularFireDatabase,
    NativeStorage,
    TabPage,
    CommonProvider,
    DatePipe,
    StatusBar,
    SplashScreen,
    Globalization,
    FCM,
    Diagnostic,
    AppVersion,
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    Geolocation,
    NativeGeocoder,
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    Market,
    Events,
    FirebaseAnalytics,
    OfflineProvider,
    Network,
    Camera,
    TemplateProvider,
    FirebaseProvider ,
    ButtonActionProvider,
    BarcodeScanner,
    MediaCapture,
     PhotoLibrary,
    FileTransfer,
    FileTransferObject,
    File,
    ImagePicker,
    Media,
    PhotoViewer,
    HaversineService,
    Diagnostic,
    Base64ToGallery,
    AndroidPermissions,
    Deeplinks,
    LaunchNavigator,
    StreamingMedia,
    Device,
    FileOpener,
    FingerprintAIO
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppModule {}
