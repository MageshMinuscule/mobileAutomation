import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, NavController, NavParams } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { Comment } from '../../app/data.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild('content', { static: false }) content: IonContent;
  @ViewChild('myChatBox', {read: ElementRef}) myChatBox: ElementRef;
  newComment: Comment = new Comment();
  isSingleMessage: boolean = false;
  userName: string;
  userEmail: string;
  userId: any;
  send: any;
  chats: any[] = [];
  selectedRequestId: any;
  title: any = 'Chat';
  disabled: any = '';
  constructor(private modalCtrl: ModalController, private route : ActivatedRoute, public router: Router, public navCtrl: NavController, public navParams: NavParams,
    private  service : ServiceProvider, public element : ElementRef) {
      this.selectedRequestId = this.navParams.data.selectedRequestId ? this.navParams.data.selectedRequestId : null;
      this.newComment.requestId  = this.selectedRequestId;
      this.title = this.navParams.data.title ? this.navParams.data.title : this.service.translatedata('comments');
      this.getData();
    this.send = this.service.translatedata('send');
    this.service.getUserProfile().then(profile => {
      let userProf = profile;
      if (userProf && userProf != null) {
        this.userName = userProf.username.toLowerCase();
        this.userEmail = userProf.email;
        this.userId = userProf.id;
        this.isSingleMessage = true;
      }
    }),error => {console.log(error)}
    this.newComment.requestId = this.selectedRequestId;

  }
ngAfterViewInit() {
  console.log("elementref----------"+this.myChatBox.nativeElement)
}
  ngOnInit() {
  }
  resizeTextarea() {
    var textarea = this.myChatBox.nativeElement.getElementsByTagName("textarea")[0];
    textarea.style.overflow = 'hidden';
    textarea.style.height = 'auto';
    return;
  }

  //scrolls to bottom whenever the page has loaded
  ionViewDidEnter() {
    this.content.scrollToBottom(300);//300ms animation speed
  }

  public adjustTextarea(event: any): void {
    let textarea: any = event ? event.target : this.myChatBox['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    textarea.style.overflow = 'hidden';
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    return;
  }

  sendMsg() {
    if (this.newComment.comment.length > 0 && this.newComment.comment.trim() != '') {
      this.disabled = 'disabled';
      this.send = this.service.translatedata('sending');;
      this.newComment.updatedByLogin = this.userEmail;
      this.newComment.updatedById = this.userId;
      this.service.createComment(this.newComment)
      .subscribe(
        resp => {
          if (null != resp) {
            this.service.genericGet("mobileservice/request-comments", this.selectedRequestId).then(data => {
              if (null != data && data.length > 0) {
                for (let c of data) {
                  c.comment = c.comment.replace(new RegExp('\n', 'g'), "<br />");
                  c.updatedByLogin = c.updatedByLogin.toLowerCase();
                }
                this.chats = data;
                this.disabled = '';
                this.send = this.service.translatedata('send');;
              }
            });
            this.newComment.comment = "";
            this.resizeTextarea();
            setTimeout(() => {
              this.content.scrollToBottom(100);
            }, 400);
          }
        }, async (err) => {
          console.log(err)
          this.disabled = '';
          this.send = this.service.translatedata('send');;
        }
      )
    }

  }

  getData() {
    this.service.genericGet("mobileservice/request-comments", this.selectedRequestId).then(data => {
      if (null != data) {
        for (let c of data) {
          c.comment = c.comment.replace(new RegExp('\n', 'g'), "<br />");
          c.updatedByLogin = c.updatedByLogin.toLowerCase();
        }
        this.chats = data;
      }
    });
  }
  back() {
    this.modalCtrl.dismiss();
  }
}
