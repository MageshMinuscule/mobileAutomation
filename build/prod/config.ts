export interface BackEnd {
  host: string;
  path: string;
}

export class Constants {
  username: string = "userName";
  deviceToken = "";
  token: string = "token";
  version: any = "v1.0";
  workflowsJson: string = "workflows";
  myRequestJson: string = "myRequests";
  pendingJson: string = "pendings";
  jobJson: string = "jobs";
  imgJson: string = "imgJson";
  firbaseProjectId: string = "cryotos-cmms";
  locationRadius: string = "LocationRadius";
  timeout: number = 60000;
  draftNewReqs: string = "draftNewReqs";
  routeDraft: string = "routeDrafts";
  routeDraftRequest: string = "routeDraftRequest";
  ackDraft: string = "ackDraft";
  reqDetailJson: string = "reqDetailJson";
  userList: string = "userList";
  msgNotificationJson: string = "msgNotificationJson";
  offlineAssetUpdate: string = "offlineAssetUpdate";
  calendarJson: string = "calendarJson";
  imageUpload: string = "imageUpload";
  checkIn: string = "checkIn";
  rejectCommentLength: Number = 200;
  assetListJson: string = "asset";
  isAsset: boolean = false;
  isWorkflow: boolean = true;
  paginationCount: string = "10";
  canAddCustomer: boolean = true;
  canReschedule: boolean = false;
  isFirestoreEnabled: boolean = true;
  env: string = "prod";
  setting: any = {
    name: "Cryotos",
    LocationRadius: 100,
    RecordCount: 5,
    Language: "en",
    timeout: 35000,
    isAsset: false,
    isWorkflow: false,
    showAll: false,
    pushPopup: true,
    IOSVersion: "1.0.0",
    AndroidVersion: "1.0.0",
    ForceUpdate: true,
    maxUserList: 15,
    AppForceUpdate: true,
    Package: "com.multitenant.cryotos",
    WorkflowTitle: {
      A: "Choose Workflow",
      B: "Choose Subworkflow",
      C: "Choose Subworkflow",
      D: "Choose Subworkflow"
    },
    LocationTitle: {
      A: "Choose Location",
      B: "Choose Sublocation"
    }
  };
}

export class CatQuestions {
  A: string = "Choose Workflow";
  B: string = "Choose Subworkflow";
  C: string = "Choose Subworkflow";
  D: string = "Choose Subworkflow";
}

export class LocQuestions {
  A: string = "Choose Location";
  B: string = "Choose Sublocation";
}

export class CustomerQuestions {
  A: String = "Select Customer";
  B: String = "Add Customer";
}

export const fireBaseConfig = {
  // Cryotos
  
  // AIzaSyBiSoZZQ42ML4z5wKJlZty3zuhKhq2zGUU // old api key
  apiKey: "AIzaSyCNWdWwYkxj7zMfpDyXqCHcrYzwvNKV-2Q", // new api key
  authDomain: "cmms-production-895632147.firebaseapp.com",
  databaseURL: "https://cmms-production-895632147.firebaseio.com",
  projectId: "cmms-production-895632147",
  storageBucket: "cmms-production-895632147.appspot.com",
  messagingSenderId: "749447955380"
};

export const firebaseAuth = {
  username: "cmmsadmin@piqotech.com",
  password: "admin2020"
};

class AppConfig {
  name: string = "Cryotos";
  backend: BackEnd = {
    host: "https://app.cryotos.com",
    path: "/"
  };
  constants: Constants = new Constants();
  catQuestions: CatQuestions = new CatQuestions();
  locQuestions: LocQuestions = new LocQuestions();
  customerQuestions: CustomerQuestions = new CustomerQuestions();

  constructor() { }
}

export let Config = new AppConfig();
