export interface BackEnd {
	host: string;
	path: string;
}

export class Constants {
	username: string = 'userName';
	deviceToken = '';
	token: string = "token";
	version: any = 'v1.0';
	workflowsJson: string = "workflows"
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
	ackDraft: string = 'ackDraft';
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
	env: string = "stage";
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
		IOSVersion: '1.0.0',
		AndroidVersion: '1.0.0',
		ForceUpdate: true,
		AppForceUpdate: false,
		maxUserList: 15,
		Package: 'com.piqotech.cryotos',
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
	A: String = 'Select Customer';
	B: String = 'Add Customer';
}

export const fireBaseConfig = {
	// Cryotos Test
	// apiKey: "AIzaSyDLW-ugqSHHDmttpdEn-TMNMyw-F8a5EJw",
	// authDomain: "piqotech-qa.firebaseapp.com",
	// databaseURL: "https://piqotech-qa.firebaseio.com",
	// projectId: "piqotech-qa",
	// storageBucket: "piqotech-qa.appspot.com",
	// messagingSenderId: "361929196857"
	apiKey: "AIzaSyAEGjyXomt7Vv9-YQPUTwsbnqLX_ec6xHg",
	authDomain: "cmms-stage.firebaseapp.com",
	databaseURL: "https://cmms-stage.firebaseio.com",
	projectId: "cmms-stage",
	storageBucket: "cmms-stage.appspot.com",
	messagingSenderId: "265630428950"
}

export const firebaseAuth = {
	username: "cmmsadmin@piqotech.com",
	password: "admin2020"
}

class AppConfig {
	name: string = 'Cryotos';
	backend: BackEnd = {
		host: 'https://stage.cryotos.com',
		path: '/',
	};
	constants: Constants = new Constants();
	catQuestions: CatQuestions = new CatQuestions();
	locQuestions: LocQuestions = new LocQuestions();
	customerQuestions: CustomerQuestions = new CustomerQuestions();

	constructor() { }
}

export let Config = new AppConfig()
