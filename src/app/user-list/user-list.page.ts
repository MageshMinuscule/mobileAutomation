import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {
  userList: any = [];
  type: any;
  checkedUser: any = [];
  users: any = [];
  isOverDue: boolean;
  overDueList: any = [];
  profile: any;
  selectAll: boolean;
  title: any = "Select User";
  indeterminateState: boolean;
  checkParent: boolean;
  searchKeyword: any;
  button: any;
  comments:any=['Pending For Spares','Others'];
  comment: any;
  reason: any;
  commentShown: boolean;
  ids: any = [];
  account: any;
  constructor(private router: Router,
    public route: ActivatedRoute,
    private firestore: AngularFirestore,
    private modalCtrl: ModalController,
    private navparams: NavParams,
    private popover: PopoverController,
    public reqService: ServiceProvider,
  ) {
    this.userList = this.navparams.data.userList;
    this.type = this.navparams.data.requestType;
    this.button = this.navparams.data.event;
    this.account = JSON.parse(localStorage.getItem('account'));
    this.route.queryParams.subscribe(params => {
      this.isOverDue = params ? params.overDue ? params.overDue : null : null
    })
    this.users = this.userList;
    if (this.account?.pauseAndPlayTimer) {
      this.getAvailableUsers();
    }
    if (this.isOverDue) {
      this.title = "Select Customer";
      this.getCustomerOutstanding();
    }
    this.route.queryParams.subscribe(params => {
      this.checkedUser = params ? params.selecteduser ? params.selecteduser : [] : null
    })

  }
  getAvailableUsers() {
    if(this.users && this.users.length > 0) {
      this.users?.forEach(async (user) => {
        if(user.userId != undefined) {
          await this.ids.push(user.userId);
        }
        
      });
      this.reqService.getUserStatus(this.ids).subscribe(async (res: any) => {
        let userResp = await res.body;
        userResp.forEach((res) => {
          this.users.forEach((user) => {
            if (res.userID == user.userId) {
              user.status = res.status;
            }
          })
        })
        console.log(this.users);
      });
    }


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserListPage');
  }

  ngOnInit() {
  }
  addOption(event, user) {
    if (event.checked) {
      this.checkedUser.push(user.userId)
    } else {
      this.checkedUser.splice(this.checkedUser.indexOf(user.userId), 1)
    }
  }

  addSingleOption() {
    const allItems = this.users.length;
    let selected = 0;
    this.checkedUser = [];
    this.users.map(item => {
      if (item.checked) {
        this.checkedUser.push(item.userId)
        selected++;
      };
    });

    if (selected > 0 && selected < allItems) {
      // One item is selected among all checkbox elements
      this.indeterminateState = true;
      this.checkParent = false;
    } else if (selected == allItems) {
      // All item selected
      this.checkParent = true;
      this.indeterminateState = false;
    } else {
      // No item is selected
      this.indeterminateState = false;
      this.checkParent = false;
    }

    // this.selectAll = false;
    // if (user.checked) {
    //   this.checkedUser.push(user.userId)
    // } else {
    //   this.checkedUser.splice(this.checkedUser.indexOf(user.userId), 1)
    // }
  }

  addAllOption($event) {
    setTimeout(() => {
      this.users.forEach(item => {
        item.checked = this.checkParent;
      });
    });


    // if (event) {
    //   this.checkedUser = [];
    //   this.users.forEach(user => {
    //     user.checked = true;
    //     this.checkedUser.push(user.userId)
    //   });
    // } else {
    //   this.checkedUser = [];
    //   this.users.forEach(user => {
    //     user.checked = false;
    //   });
    // }
  }

  getCustomerOutstanding() {
    this.reqService.getUserProfile().then(info => {
      if (info) {
        this.profile = info;
      }
      if (this.profile && this.profile.email) {
        let outstandingCollectionRef = this.firestore.collection('sea').doc("overDue").collection(this.profile.email);
        outstandingCollectionRef.valueChanges().subscribe(res => {
          this.overDueList = res;
          this.userList = res;
        });
      }
    });
  }

  selectItem(item) {
    console.log(item);
    let navigationExtras: NavigationExtras = {
      queryParams:{
        overDue: item
      }
    }
    this.router.navigate(['/outstanding'], navigationExtras);
  }

  prepareCustomer() {
    this.userList = [];
    for (const due of this.overDueList) {
      let customer = {
        userName: due.Name,
        OverDue: due.OverDue,
        WithInDue: due.WithInDue
      }
      this.userList.push(customer);
    }
    this.users = this.userList;
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

 async  addUsers() {
    let data = {
      userList: this.checkedUser
    }
    await this.modalCtrl.dismiss(data);
  }

  filterResult(Keyword, value?) {
    let val = value ? value : Keyword.target.value;
    val = val ? (val.trim() ? val.trim().replace(new RegExp("\\s+", "gm"), ' ') : '') : '';
    if (this.isOverDue) {
      if (val && val.length > 1) {
        this.overDueList = this.userList.filter((item) => {
          return (item.Name.toLowerCase().indexOf(val.toLowerCase()) > -1);
        });
      } else {
        this.overDueList = this.userList;
      }

    } else {
      if (val && val.length > 1) {
        this.users = this.userList.filter((item) => {
          return (item.userName.toLowerCase().indexOf(val.toLowerCase()) > -1);
        });
      } else {
        this.users = this.userList;
      }

    }
  }
  async saveReason()
  {
    let comments = [{comments:this.comment , reason:this.reason}]    
    await this.popover.dismiss(comments)
  }
  async cancelReason()
  {
    await this.popover.dismiss();
  }


}
