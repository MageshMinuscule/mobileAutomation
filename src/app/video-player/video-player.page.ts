import { Component, OnInit, ViewChild } from '@angular/core';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { Config } from '../config'
@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.page.html',
  styleUrls: ['./video-player.page.scss'],
})
export class VideoPlayerPage implements OnInit {
  @ViewChild('myVideo') myVideo: any;
  fileName: any;
  videoId: any;
  loader: any;
  urlData: any;
  constructor(
    public navParams: NavParams, 
    private transfer: FileTransfer, private common: CommonProvider, 
    public reqService: ServiceProvider,  private streamingMedia: StreamingMedia, private modalCtrl : ModalController
  ) {
    this.videoId = navParams.data.value ? navParams.data.value : null;
    this.fileName = navParams.data.fileName ?navParams.data.fileName : null;
   }

  ngOnInit() {
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
  uploadVideo() {
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
          this.urlData = data;
          this.common.stopLoading();
          this.modalCtrl.dismiss(data);
          this.common.alertToast(this.reqService.translatedata('Video is uploaded Successfully'));
        }, (err) => {
          // error
          this.common.stopLoading();
          if (err.code == 3) {
            this.common.alertToast(this.reqService.translatedata('Video size exceeds'));
          } else {
            this.common.alertToast(this.reqService.translatedata('Video not uploaded') + JSON.stringify(err));
          }
        });
    } else {
      this.common.alertToast(this.reqService.translatedata("Offline video upload currently not available.Please try with network connection"));
    }
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }
  remove() {
    this.modalCtrl.dismiss('remove')
  }
}
