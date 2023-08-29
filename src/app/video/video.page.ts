import { Component, Input, OnInit } from '@angular/core';
import { CaptureVideoOptions, MediaCapture, MediaFile } from '@ionic-native/media-capture/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';
import { Camera ,CameraOptions } from '@ionic-native/camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Config } from '../config';
import { OverlayEventDetail } from '@ionic/core';
import { VideoPlayerPage } from '../video-player/video-player.page';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

declare let window: any;
@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})
export class VideoPage implements OnInit {
  @Input('incident') incident : any
  @Input('name') name : any
  text: string;
  isBrowser: any;
  videoId: any;
  flag_upload = true;
  flag_play = true;
  fileName: any = 'video.mp4';
  value: any;

  constructor(
    public templateProvider: TemplateProvider,
    public common: CommonProvider,
    public modalCtrl: ModalController,
    private transfer: FileTransfer,
    public platform: Platform,
    public camera: Camera,
    public mediaCapture: MediaCapture,
    public photoLibrary: PhotoLibrary,
    private streamingMedia: StreamingMedia,
    private diagnostic: Diagnostic
  ) {
    console.log('Hello VideoComponent Component');
    this.text = 'Hello World';
    this.isBrowser = platform.is('cordova') ? false : true;
  }

  ngOnInit() {
    console.log(this.incident,'incident Page ');
  }
   // For browser Video
   selectBrowserVideo(event: any, incident) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        let base64String = event.target.result.split(",")[1];
        incident.value = base64String;
        this.presentVideoModal(incident);
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  // Open Gallery Video
  openGalleryVideo(incident) {
    console.log('testTakeVideo');
    let cameraOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 20,
      mediaType: this.camera.MediaType.VIDEO
    }

    this.camera.getPicture(cameraOptions).then((fileUri) => {
      this.videoId = fileUri;
      console.log("Video Path" + this.videoId);
      // window.resolveLocalFileSystemURL("file://" + fileUri, FE => {
      //   this.videoId = FE.toURL();
      // });

      this.fileName = fileUri.substr(fileUri.lastIndexOf('/') + 1);
      incident.value = this.fileName;
      this.flag_play = false;
      this.flag_upload = false;
      this.presentVideoModal(incident);
    }, (err) => {
    });
  }

  // Capture Video
  takeVideo(incident) {
    console.log('testTakeVideo');
    this.diagnostic.requestRuntimePermission('WRITE_EXTERNAL_STORAGE');
    let options: CaptureVideoOptions = { limit: 1, quality :0.5, duration:60};
    this.mediaCapture.captureVideo(options)
      .then((data : MediaFile[]) => {
        var i, path, len;
        for (i = 0, len = data.length; i < len; i += 1) {
          path = data[i].fullPath;
          this.fileName = data[i].name;
        }
        this.flag_play = false;
        this.flag_upload = false;
        if (this.platform.is('android')) {
          window.resolveLocalFileSystemURL(path, FE => {
            this.videoId = FE.toURL();
            incident.value = this.fileName;
            this.presentVideoModal(incident);
          });
        } else {
          this.videoId = path;
          window.resolveLocalFileSystemURL("file://" + path, FE => {
            this.videoId = FE.toURL();
          });
          incident.value = this.fileName;
          // this.uploadVideo(incident);
          console.log("Video Path" + this.videoId);
          this.photoLibrary.requestAuthorization().then(() => {
            this.photoLibrary.saveVideo(path, 'Videos').then(res => {
              console.log(res);
              this.openGalleryVideo(incident);
            }, err => {
              console.log(err);
            })
          })
            .catch(err => console.log('permissions weren\'t granted'));
          this.openGalleryVideo(incident);
        }
      });
  }

  uploadVideo(incident) {
    if (navigator.onLine) {
      this.common.displayLoading();
      const fileTransfer: FileTransferObject = this.transfer.create();
      let auth = localStorage.getItem('auth-token');
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: this.fileName,
        mimeType: "video/mp4",
        chunkedMode: false,
        params: {
          fileName: this.fileName,
          name: 'video'
        },
        headers: {
          Authorization: auth
        }
      }
      fileTransfer.upload(this.videoId, encodeURI(Config.backend.host + 'mobileservice/fileUpload'), options)
        .then((data) => {
          this.common.stopLoading();
          if (data) {
            incident.value = data.response ? data.response : '';
          } else {
            incident.value = '';
          }
          this.common.alertToast('Video is uploaded Successfully!');
        }, (err) => {
          this.common.stopLoading();
          incident.value = '';
          if (err.code == 3) {
            this.common.alertToast('Video size exceeds 10MB!');
          } else {
            this.common.alertToast('Video not uploaded!' + JSON.stringify(err));
          }
        });
    } else {
      this.common.alertToast("Offline video upload currently not available.Please try with network connection.");
    }
  }

  async presentVideoModal(incident) {
    let videoModal = await this.modalCtrl.create({
      component : VideoPlayerPage,
      componentProps : { requestType: 'newRequest', id: incident.id, value: this.videoId, fileName: this.fileName }
    });
    videoModal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data
      if(data == 'remove') {
        this.incident.value = '';
      } else if (data) {
        incident.value = data.response ? data.response : '';
      } else {
        incident.value = '';
      }
    });
    await videoModal.present();
  }
  deleteVideo(incident) {
    incident.value = ''
  }
  playVideo() {
    let options: StreamingVideoOptions = {
      successCallback: () => { console.log('Video played') },
      errorCallback: (e) => { console.log('Error streaming') },
      orientation: 'portrait',
      shouldAutoClose: true,
      controls: false
    };
    
    this.streamingMedia.playVideo(this.videoId, options);
  }
}


// VideoPage, { requestType: 'newRequest', id: incident.id, value: this.videoId, fileName: this.fileName }
