export class NestWorkflow {
  id: string = "";
  name: string = "";
  description: string = "";
  active: boolean = false;
  creation_date: string = "";
  updation_date: string = "";
  version: string = "";
  parent_workflowId: string = "";
  checkInType: string = "";
  templateId: string = "";
  templateName: string = "";
  templateSchema: string = "";
  equipment: any[] = [];
  childWorkflows: any[] = [];
  locationTree: any[] = [];
  templateHistoryId: string = "";
  constructor() { }
}

export class NestLocation {
  childLocationTreeDTOs: any[] = [];
  id: string = "";
  locationHierarchy: string = "";
  latitude: string = "";
  longitude: string = "";
  name: string = "";
  qrCodeText: string = "";
  constructor() { }
}

export class Asset {
  id: string = "";
  name: string = "";
  desc: string = "";
  manufacturer: string = "";
  modelId: string = "";
  dateOfPurchase: string = "";
  installedOn: string = "";
  warrantyExpiredOn: string = "";
  cost: string = "";
  createdDate: string = "";
  lastUpdateDate: string = "";
  locationId: string = "";
  locationName: string = "";
  workflowId: string = "";
  workflowName: string = "";
  constructor() { }
}

export class LocationDetails {
  id: string = "";
  name: string = "";
  description: string = "";
  active: boolean = false;
  creation_date: string = "";
  updation_date: string = "";
  qrCodeText: string = "";
  latitude: number = 0;
  longitude: number = 0;
  locationHierarchy: string = "";
  childLocationTreeDTOs: any[] = [];

  constructor() { }
}

export class Incident {
  constructor() { }
  id: string = "";
  status: string = "";
  emailTemplateList: any;
  assetSerialNo: any;
  requestStatus: string = "";
  workflowId: string = "";
  workflowName: string = "";
  locationId: string = "";
  endLocationId: any;
  locationName: string = "";
  creationDate: string = "";
  lastUpdated: string = "";
  templateHistoryId: string = "";
  templateValue: string = "";
  version: number = 0;
  clientPortalRequestId: any;
  equipments: any;
  requestId: any;
  ackReq: any;
  checkinRequired: any;
  checkoutRequired: any;
  trackingRequired: any;
  action: string;
  routeForm: any;
  requestHistoryId: number = 0;
  requestPriority: string = "";
  actionTabName: string = "";
  rejectionComments: string = "";
  rejectionReason: string = "";
  temp: any = "";
  stage: string;
  priority: string = "";
  description: string = "";
  checkInType: string = "";
  langitute: any;
  latitude: any;
  qrCode: any;
  checkInDetail: any = {};
  endLocationQrCode: any;
  endLocationLatitude: any;
  endLocationLongitude: any;
  requestType: string;
  locationPath: string;
  workflowPath: string;
  scheduleStartDateTime: string;
  scheduleEndDateTime: string;
  Duration: string;
  inventories: any[] = [];
  requestCost: any;
  assetId: any;
  assetName: any;
  companyId: any;
  companyName: any;
  startedBy: any;
  startedById: any;
  inventoryDTOList: any[] = [];
  active: boolean;
  nextScheduleTime: any;
  userList: any = [];
  userId: any;
  tagId: any;
  isAssetTransfer: boolean;
  assetCurrentLocationId : any;
  assetTransferLocationId : any;
  reportEmail: any;
  stateId : any;
  requestKey : any;
  templateCategory:any;
  templateCategoryId:any;
  slaTimeBreachInHours:any;
  scheduleTime:any;
}

export interface IncidentList {
  id: string;
  status: string;
  requestStatus: string;
  workflowId: string;
  assetSerialNo: string;
  workflowName: string;
  locationId: string;
  endLocationId: any;
  locationName: string;
  creationDate: string;
  lastUpdated: string;
  templateHistoryId: string;
  templateValue: string;
  version: string;
  equipments: any;
  requestId: any;
  ackReq: any;
  checkinRequired: any;
  checkoutRequired: any;
  action: string;
  routeForm: any;
  requestHistoryId: number;
  requestPriority: string;
  actionTabName: string;
  rejectionComments: string;
  temp: any;
  stage: string;
  priority: string;
  checkInType: string;
  langitute: any;
  latitude: any;
  qrCode: any;
  checkInDetail: any;
  endLocationQrCode: any;
  endLocationLatitude: any;
  endLocationLongitude: any;
  requestType: string;
  locationPath: string;
  workflowPath: string;
  scheduleStartDateTime: string;
  scheduleEndDateTime: string;
  Duration: string;
  inventories: any[];
  requestCost: any;
  assetId: any;
  inventoryDTOList: any[];
  active: boolean;
  userList: any;
  userId: any;
}

export class PendingList {
  scheduledRequest: any = {};
  workRequest: any = [];
  constructor() { }
}

export interface ResultSet {
  acknowledge: any;
  acknowledgeCount: number;
  checkIn: any;
  checkInCount: number;
  workInProgress: any;
  workInProgressCount: number;
}

export class Token {
  id: string = "";
  token: string = "";
  devieType: string = "Mobile";
  userId: number = 0;
  userEmail: string = "";
  creationDate: string = "";
  updatedDate: string = "";
  organizationId: number = 0;
  active: boolean = true;
  deviceId: string = "";
}

export class User {
  id: string = "";
  username: string = "";
  langKey: string = "";
  email: string = "";
  constructor() { }
}

export class Comment {
  id: string = "";
  comment: string = "";
  requestId: number = 0;
  submittedDate: string = "";
  updatedById: string = "";
  updatedByLogin: string = "";
}

export class Acknowledge {
  acknowledge: boolean = true;
  requestHistoryId: number = 0;
  requestType: string = "";
}

export class StartWork {
  started: boolean = true;
  requestHistoryId: number = 0;
  latitude: string = "0.0000";
  longitude: string = "0.0000";
}

export class CheckIn {
  checkInDetail: any = "";
  checkOutDetail: string = "";
  checkInType: string = "";
  requestType: string = "";
  latitude: string = "0.0000";
  longitude: string = "0.0000";
  requestHistoryId: number = 0;
}

export class Annotate {
  indexId: number = 0;
  curXPos: number = 0;
  curYPos: number = 0;
  dataX: number = 0;
  dataY: number = 0;
  noteText: string = "";
}

export class ImageUpload {
  id: string = "";
  imageBlob: string = "";
  imageBlobContentType: string = "";
  userId: string = "";
  annotationString: string = "";
}

export class AWSImageUpload {
  requestId: string = "New";
  baseImage: string = "";
}

export class GetAwsImage {
  key: string = "";
}

export class AWSImageData {
  id: string = "";
  imageBlob: string = "";
}

export class RequestWithoutWorkflow {
  workflowId: string = "";
  workflowName: string = "";
  creationDate: string;
  id: string = "";
  imageId: string = "";
  locationId: string = "";
  locationName: string = "";
  rasiedById: string = "";
  rasiedByLogin: string = "";
  remarks: string = "";
  status: string = "";
  updationDate: string = "";
  userId: string = "";
  userLogin: string = "";
  assigneeImageId: string = "";
  assigneeComment: string = "";
}

export class Attendance {
  id: number;
  active: boolean;
  creationDate: any;
  employeeUserId: number;
  employeeId: number;
  employeeUserName: string;
  locationId: number;
  locationName: string;
  organizationId: string;
  punchedInById: string;
  punchedInByLogin: string;
  punched_in_lat: string;
  punched_in_lon: string;
  punched_in_photo: string;
  punchedOutById: string;
  punchedOutByLogin: string;
  punched_out_lat: string;
  punched_out_lon: string;
  punched_out_photo: string;
  updationDate: any;
  version: number;
  constructor() { }
}
export class RequestData {
  templateHistId: any;
  locationName: any;
  customerName: any;
  workflowId: any;
  workflowName: any;
  locationId: any;
  assetId: any;
  customerId: any;
  assetTransferLocation : any;
  isAssetTransfer : boolean;
  stateId : any;
  templateCategory: any;
  constructor() { }
}

export class pendingCountDto {
  acknowledge: any = [];
  acknowledgeFull = [];
  acknowledgeCount = 0;
  checkIn = [];
  checkInFull = [];
  checkInCount = 0;
  workInProgress = [];
  workInProgressFull = [];
  workInProgressCount = 0;
  constructor() { }
}

export class MaterialDto {
  locationId: any;
  customerId: any;
  materialCustomerId: any;
  materialCustomerRate: any;
  amount: any;
  quantity: any;
  locationName: any;
  customerName: any;
  name: any;
  constructor() { }
}
export class AssetDownTimeTracking {
  public issueStartTime?: any;
  public issueEndTime?: any;
  public type?: any;
  public rootCause?: any;
  public assetId?: any;
  public assetSerialNumber?: any;
  public downTimeDurationInHours?: any;
  public downTimeDurationMinutes?: any;
  public correctiveAction?: any;

  constructor() {}
}
export class AssetFilter {
  public locationId?: any;
  public savedForm?: string;
  public companyName?: any;
  public locationName?: any;
  public searchUserText?: string;
  public sortByFilter?: any;
  public customerId?: number;
  public categoryId?: number;
  public categoryName?: any;
  appliedFilterCount: number;
  workflowId: any;
  public departmentId?: number;
  public departmentName?: string;
  constructor() {}
}

export class PendingFilter {
  public selectedCategory?: any;
  public selectedCustomer?: any;
  public selectedLocation?: any;
  public selectedAsset?: any;
  public selectedWorkflow?: any;
  public childLocations?: any;
  public selectedStatus?:any;
}

export class JobsFilter {
    public action?: any;
    public active?: boolean;
    public categoryId ?: number;
    public categoryName?: any;
    public creationDate?: any;
    public id?: number;
    public isTableView?: boolean;
    public locationId?: number;
    public locationName?: any;
    public locationPath?: any;
    public organizationId?: any;
    public requestDescription?: any;
    public requestId?: number;
    public requestLastUpdated :any;
    public requestLastUpdatedBy?: any;
    public requestPriority?: any;
    public requestRaisedBy?: any;
    public requestStatus?: any;
    public requestSubmissionDate?: any;
    public requestType?: any;
    public scheduleEndDateTime?: any;
    public scheduleName?: any;
    public scheduleStartDateTime?: any;
    public shift?: any;
    public tagId?: number;
    public updationDate?: any;
    public userIds?: any[];
    public version?: number;
    public workflowId?: number;
    public workflowName?: any;
    public workflowPath?: any;
    public selectedAsset?: any;
    public selectedCategory?: any;
    public selectedLocation?: any;
    public SelectedWorkflow?: any;
    public childLocations?: any;
    public searchText ?: any;
    public companyId ?: any;
    public companyName?: any;
    public assetId?:any
}


export const enum Priority {
  'CRITICAL',
  'URGENT',
  'NORMAL'
}
export class PortalRequest  {
  
  constructor(
    public id?: number,
    public status?: string,
    public action?: string,
    public request_cost?: number,
    public description?: any,
    public expectedDate?: any,
    public raisedById?: number,
    public raisedByName?: string,
    public priority?: any,
    public active?: boolean,
    public version?: number,
    public creationDate?: any,
    public updationDate?: any,
    public assetId?: number,
    public assetName?: string,
    public assetSerialNo?: any,
    public locationId?: number,
    public locationName?: string,
    public companyId?: number,
    public customerName?: string,
    public companyName?: string,
    public workType?: any,
    public s3ImageId?: any,
    public isEquipmentDown?: boolean,
    public comments?: any,
    public requestId?: number,
    public imageDescription?: any,
    public rejectReason?: any,
    public emailIds?: any,
    public invoiceReferenceNumber?: any,
    public feedbackStarRating?: any,

    public feedbackDescription?: any,
    public workRequestId?: number,
    public tenantName?: any,
    public categoryId?: number,
    public categoryName?: any,
    public contactName?: any,
    public contactNumber?: any,
    public projectReferenceNumber?: any,
    public customJson?: any
  ) {}
  }
export class S3ImageFormat {
  public requestId?: string;
  public baseImage?: string;
  constructor() {
    this.requestId = 'New';
  }
}
export class RequestTimer {
  constructor(
    public id?: number,
    public active?: boolean,
    public version?: number,
    public creationDate?: any,
    public updationDate?: any,
    public requestId?: Number,
    public userId?: Number,
    public requestHistoryId?: Number,
    public duration?: any,
    public startTime?: any,
    public endTime?: any,
    public pauseReason?: any,
    public status?: any,
    public isPauseExistingRequests?: boolean,
    public requestKey?: any,
  ) {}
}