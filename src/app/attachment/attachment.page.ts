import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform} from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import{ File } from '@ionic-native/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Config } from '../config';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.page.html',
  styleUrls: ['./attachment.page.scss'],
})
export class AttachmentPage implements OnInit {
  @Input() requestId: any;
  @Input() status: any;
  @Input() locationId: any;
  assetId: any;
  attachmentList = [];
  target: any;
  noRecords: boolean;
  constructor(
    private modalCtrl: ModalController,
    private reqService: ServiceProvider,
    private common: CommonProvider,
    public service: ServiceProvider,
    public router: Router,
    private platform: Platform,
    private transfer: FileTransfer,
    private file: File,
    private fileOpener: FileOpener

  ) {
    
  }
  back() {
    this.modalCtrl.dismiss().catch(() => {});
  }
  getAttachments(id, model) {
    // this.common.displayLoading();
    this.reqService.getAttachments(id, model).subscribe((resp) => {
      this.attachmentList = [...this.attachmentList, ...resp.body];
      setTimeout(() => {
        this.noRecords = this.attachmentList?.length == 0 ? true : false;
      }, 1500);
      // this.common.stopLoading();
    },async(err)=>{
      // this.common.stopLoading();
    });
  }

  ngOnInit() {
    if (this.requestId) {
      this.getAttachments(this.requestId, 'request');
    }
    if (this.assetId) {
      this.getAttachments(this.assetId, 'asset');
    }
    if (this.locationId) {
      this.getAttachments(this.locationId, 'location');
    }
  }
  getMIMEtype(extn) {
    let ext = extn.toLowerCase();
    let MIMETypes = {
      txt: 'text/plain',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      bmp: 'image/bmp',
      png: 'image/png',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      rtf: 'application/rtf',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      csv: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return MIMETypes[ext];
  }
  openLink(file) {
    this.common.displayLoading();
    this.target = this.platform.is('android')
      ? this.file.externalApplicationStorageDirectory
      : this.file.documentsDirectory;
    let fileExtn = file.s3FileName.split('.').reverse()[0];
    let fileMIMEType = this.getMIMEtype(fileExtn);
    let auth = localStorage.getItem('auth-token');
    console.log('download started');
    this.common.alertToast('Downloading.....');
    const fileTransfer: FileTransferObject = this.transfer.create();
    let downloadUrl = Config.backend.host + 'files/getFile/' + file.s3FileName;
    fileTransfer
      .download(encodeURI(downloadUrl), this.target + file.s3FileName, false, {
        headers: {
          Authorization: auth,
        },
      })
      .then((entry) => {
        this.fileOpener
          .open(entry.toURL(), fileMIMEType)
          .then(() => {
            this.common.alertToast('Downloaded Successfully....');
            this.common.stopLoading();
          })
          .catch((e) => {
            this.common.alertToast(
              'Cant open this attachment file. Please try again after some time'
            );
            this.common.stopLoading();
          });
      })
      .catch((e) => {
        this.common.alertToast(
          'Cant open this attachment file. Please Try again after some time'
        );
        this.common.stopLoading();
      });
  }
}
