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
	env: string = "qa";
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
		AppForceUpdate: true,
		Package: 'com.cryotos.qa',
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
	// Cryotos-QA
	apiKey: "AIzaSyChz1qgFbYe0MXywk2FMJRjkrEjmu-Wx-o",
	authDomain: "cmms-qa-79af5e2e.firebaseapp.com",
	databaseURL: "https://cmms-qa-79af5e2e.firebaseio.com",
	projectId: "cmms-qa-79af5e2e",
	storageBucket: "cmms-qa-79af5e2e.appspot.com",
	messagingSenderId: "54177937009"
}

export const firebaseAuth = {
	username: "cmmsadmin@piqotech.com",
	password: "admin2020"
}

class AppConfig {
	name: string = 'Cryotos';
	backend: BackEnd = {
		host: 'http://qa.cryotos.com',
		path: '/',
	};
	constants: Constants = new Constants();
	catQuestions: CatQuestions = new CatQuestions();
	locQuestions: LocQuestions = new LocQuestions();
	customerQuestions: CustomerQuestions = new CustomerQuestions();

	constructor() { }
}

export let Config = new AppConfig()
