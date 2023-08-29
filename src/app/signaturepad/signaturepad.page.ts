import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
// import SignaturePad from 'signature_pad';
import { ServiceProvider } from 'src/providers/service/service';
import { Annotate, AWSImageUpload } from '../data.model';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonProvider } from '../common/common';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signaturepad',
  templateUrl: './signaturepad.page.html',
  styleUrls: ['./signaturepad.page.scss'],
  providers: [ServiceProvider],
})
export class SignaturepadPage implements OnInit, AfterViewInit {
  retry: boolean;
  @ViewChild('canvas', { static: true }) signaturePadElement;
  signaturePad: any;
  canvasWidth: number;
  canvasHeight: number;
  image_type: string = "images/jpeg";
  id: any;
  private imageSrc: string = "";
  public annotations: Annotate[];
  // signaturePadOptions: any = {
  //   minWidth: 5
  // };
  width: any;
  constructor(private elementRef: ElementRef,
    private base64ToGallery: Base64ToGallery, 
    private androidPermissions: AndroidPermissions,   
    public modalCtrl: ModalController,
    private common: CommonProvider,
    private reqService: ServiceProvider,
    private navparms : NavParams ) {
      if(this.navparms.data['value']){
            this.imageSrc = this.navparms.data['value'];
          }
     }
ngOnInit(): void {
  this.init();
}
  dismiss() {
    this.modalCtrl.dismiss();
  }
  getAnnotatedURL() {
    let data = this.signaturePad.toDataURL();
    return data.replace(data.substring(0, data.indexOf('64,') + 3), '');
  }
  offlineUpdate() {
    let data = {
      imageSrc: this.getAnnotatedURL(),
      id: this.id,
      imgId: '',
    };
    this.modalCtrl.dismiss(data);
  }
  imgUpdate() {
    let success;
    if (this.signaturePad.isEmpty()) {
      this.common.alertToast(
        this.reqService.translatedata('blankPageSaveError')
      );
      return;
    }
    this.imageSrc = this.getAnnotatedURL();
    if (this.imageSrc.length > 0 && navigator.onLine) {
      this.common.displayLoading();
      let uploadJson = new AWSImageUpload();
      uploadJson.baseImage = this.getAnnotatedURL();
      this.reqService.genericAwsPost(uploadJson)
      .subscribe(data =>{
        let message;
        let uploadId;
        if (data) {
          message = 'success';
          success = true;
          uploadId = data;
        } else {
          if (!this.retry && navigator.onLine) {
            this.common.stopLoading();
            this.imgUpdate();
            this.retry = true;
          } else {
            message = 'failure';
            success = true;
          }
        }
        if (success) {
          this.common.stopLoading();
          let info = {
            imageSrc: this.getAnnotatedURL(),
            id: this.id,
            imgId: uploadId,
            status: message,
          };
          this.modalCtrl.dismiss(info);
        }
      },async (err)=>{
        this.common.stopLoading();
        this.common.alertToast(err.status+"error in genericAwsPost.......")
      })
    } else {
      this.offlineUpdate();
    }
  }
  clearAnnotate() {
    this.signaturePad.clear();
    this.signaturePad.on();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.init();
  }

  init() {
    const canvas: any = this.elementRef.nativeElement.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 140;
    if (this.signaturePad) {
      this.signaturePad.clear(); // Clear the pad on init
    }
  }

  public ngAfterViewInit(): void {
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement);
    this.signaturePad.clear();
    this.signaturePad.penColor = 'rgb(47,48,49)';
    let minwidth = 5;
    let maxWidth = 10;
    this.signaturePad.dotSize = 0;
    this.signaturePad.minWidth = minwidth;
    this.signaturePad.maxWidth = maxWidth;
  }

  save(): void {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
      result => {
        if (result.hasPermission) {
          const img = this.signaturePad.toDataURL();
          this.base64ToGallery.base64ToGallery(img).then(
            res => console.log('Saved image to gallery ', res),
            err => console.log('Error saving image to gallery ', err)
          );
        }
        else {
          this.requestPermissions();
        }
      },
      err => this.requestPermissions()
    );
  }

  requestPermissions() {
    this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE])
      .then(
        res => {
          console.log('Saved image to gallery ', res);
          this.save();
        },
        err => console.log('Error saving image to gallery ', err)
      );
  }

  isCanvasBlank(): boolean {
    if (this.signaturePad) {
      return this.signaturePad.isEmpty() ? true : false;
    }
  }

  clear() {
    this.signaturePad.clear();
  }

  undo() {
    const data = this.signaturePad.toData();
    if (data) {
      data.pop(); // remove the last dot or line
      this.signaturePad.fromData(data);
    }
  }
}
