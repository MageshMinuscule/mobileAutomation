import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { Config } from '../config';

@Component({
  selector: 'app-asset-filter',
  templateUrl: './asset-filter.page.html',
  styleUrls: ['./asset-filter.page.scss'],
})
export class AssetFilterPage implements OnInit {
  categoryArray: any[];
  locationArray: any[];
  btnTxt = 'Apply';
  category: any = {};
  location: any = {};
  parentCategory: any[] = [];
  parentLocation: any[] = [];
  categoryResults: any[];
  results: any[];
  selectedItem: any;
  selectedParentItem: any;
  subCategory: any = {};
  selectedCategory: any = {};
  selectedLocation: any = {};
  parentCategoryResults: any[];
  parentLocationResults: any[];
  subCategoryResults: any[];
  childCategories: any[] = [];
  childLocations: any[] = [];
  categoryTitles: any[] = [];
  parentCategoryTitle: any = 'Category';
  filterCount: number = 0;
  module: any;
  constructor(
    public firestore: AngularFirestore,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    private navparams : NavParams,
    private reqService: ServiceProvider,
  ) {
      let profile = JSON.parse(window.localStorage.getItem('Profile'));
      this.category = this.navparams.data['category'] ? this.navparams.data['category'] : {};
      this.childCategories = this.navparams.data['childCategories'] ? this.navparams.data['childCategories'] : [];
      this.selectedCategory = this.navparams.data['selectedCategory'] ? this.navparams.data['selectedCategory'] : [];
      this.location = this.navparams.data['location'] ? this.navparams.data['location'] : {};
      this.childLocations = this.navparams.data['childLocations'] ? this.navparams.data['childLocations'] : {};
      this.childLocations = this.location.id ? this.childLocations : [];
      this.module = this.navparams.data['module'];
      Config.constants.isAsset = profile.workflowType == 'asset' ? true : false;
        let catgoryCollectionRef = this.firestore
          .collection('organization')
          .doc(profile.tenantId)
          .collection('category');
        catgoryCollectionRef.valueChanges().subscribe((res) => {
          this.categoryArray = res;
          if (this.categoryTitles && this.categoryTitles.length) {
            this.parentCategoryTitle = this.categoryTitles[0];
          }
          this.prepareParentCategory();
        });
        let locationCollectionRef = this.firestore
          .collection('organization')
          .doc(profile.tenantId)
          .collection('location');
        locationCollectionRef.valueChanges().subscribe((res) => {
          this.locationArray = res;
          console.log('response ' + this.locationArray[0]);
          this.prepareParentLocation();
        });
  }

  ngOnInit() {}
  ionViewDidLoad() {
    console.log('ionViewDidLoad AssetFilterPage');
  }
  fieldOnFocus(type, category?, location?) {
    switch (type) {
      case 'category':
        if (!this.category.name)
          this.parentCategoryResults = [...this.categoryArray];
        break;
      case 'subCategory':
        category.childs = category.childCategory;
        break;
      case 'location':
        if (!this.location.name)
          this.parentLocationResults = [...this.parentLocation];
        break;
      case 'subLocation':
        location.childs = location.childLocation;
        break;
      default:
        break;
    }
  }
  filterParentCategoryResult(event, type) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    // this.category = {};
    this.parentCategoryResults = this.parentCategory;
    if (name != "") {
      this.parentCategoryResults = this.parentCategory.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    } else {
      this.selectedCategory = {};
      this.category = {
        name: '',
      };
    }
  }

  filterSubCategoryResult(event, category?) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    category.childs = category.childCategory;
    if (name) {
      category.childs = category.childCategory.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    }else {
      this.selectedCategory = {};
    }
  }

  clearResults(type, category?, location?) {
    setTimeout(() => {
      switch (type) {
        case 'category':
          this.parentCategoryResults = [];
          break;
        case 'subCategory':
          category.childs = [];
          break;
        case 'location':
          this.parentLocationResults = [];
          break;
        case 'subLocation':
          location.childs = [];
          break;
        default:
          break;
      }
    }, 100);
  }

  prepareParentCategory() {
    this.parentCategory = [];
    for (let category of this.categoryArray) {
      if (category.active) {
        if (!category.parentCategoryId) {
          let custom = {
            name: category.name,
            id: category.id,
          };
          this.parentCategory.push(custom);
        }
      }
    }
  }

  selectCategory(category, type, childCategory?, categoryIndex?) {
    this.loadChidCategories(category);
    if (type === 'parent') {
      this.category = { ...category };
    } else {
      childCategory.name = category.name;
      childCategory.id = category.id;
    }
    if (
      category.results.length > 0 &&
      this.selectedCategory.id != category.id
    ) {
      if (categoryIndex < this.childCategories.length) {
        let tempChilds = [];
        for (let index = 0; index <= categoryIndex; index++) {
          tempChilds.push(this.childCategories[index]);
        }
        this.childCategories = tempChilds;
      }
      this.childCategories.push({
        childCategory: category.results,
        title: this.getCategoryTitle(),
        childs: [],
        name: '',
        id: null,
      });
    }
    this.selectedCategory = category;
  }

  getCategoryTitle() {
    return this.categoryTitles.length &&
      this.categoryTitles.length >= this.childCategories.length
      ? this.categoryTitles[this.childCategories.length + 1]
      : 'Sub Category';
  }

  loadChidCategories(selectedCategory) {
    selectedCategory.results = [];
    for (let category of this.categoryArray) {
      if (category.parentCategoryId == selectedCategory.id) {
        selectedCategory.hasChild = true;
        let custom = {
          name: category.name,
          id: category.id,
        };
        selectedCategory.results.push(custom);
      }
    }
  }

  // Location
  prepareParentLocation() {
    this.parentLocation = [];
    for (let location of this.locationArray) {
      if (location.active) {
        if (!location.parentLocationId) {
          let custom = {
            name: location.name,
            id: location.id,
          };
          this.parentLocation.push(custom);
        }
      }
    }
  }

  filterParentLocationResult(event, type) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    // this.location = {};
    this.parentLocationResults = this.parentLocation;
    if (name) {
      this.parentLocationResults = this.parentLocation.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    }else {
      this.selectedLocation = {};
    }
  }

  selectLocation(location, type, sublocation?, locationIndex?) {
    this.loadChildLocations(location);
    if (type === 'parent') {
      this.location = { ...location };
    } else {
      sublocation.name = location.name;
      sublocation.id = location.id;
    }
    if (
      location.results.length > 0 &&
      this.selectedLocation.id != location.id
    ) {
      if (locationIndex < this.childLocations.length) {
        let tempChilds = [];
        for (let index = 0; index <= locationIndex; index++) {
          tempChilds.push(this.childLocations[index]);
        }
        this.childLocations = tempChilds;
      }
      this.childLocations.push({
        childLocation: location.results,
        title: this.getCategoryTitle(),
        childs: [],
        name: '',
        id: null,
      });
    }
    this.selectedLocation = location;
  }

  loadChildLocations(selectedLocation) {
    selectedLocation.results = [];
    for (let location of this.locationArray) {
      if (location.parentLocationId == selectedLocation.id) {
        selectedLocation.hasChild = true;
        let custom = {
          name: location.name,
          id: location.id,
        };
        selectedLocation.results.push(custom);
      }
    }
  }
  filterSubLocationResult(event, location) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    location.childs = location.childLocation;
    if (name) {
      location.childs = location.childLocation.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    }else {
      this.selectedLocation = {};
    }
  }

  applyFilter() {
    if(this.selectedLocation && this.selectedLocation.name) {
      this.filterCount = this.countCal(this.selectedLocation);
    }
    if(this.selectedCategory && this.selectedCategory.name) {
      this.filterCount = this.countCal(this.selectedCategory);
    }
    let data = {
      selectedCategory: this.selectedCategory,
      category: this.category,
      childCategories: this.childCategories,
      selectedLocation: this.selectedLocation,
      location: this.location,
      childLocations: this.childLocations,
      count : this.filterCount
    };
    this.modalCtrl.dismiss(data);
  }
  countCal(val: any) {
    if(val.name && val.id) {
      this.filterCount++;
    }
    return this.filterCount;
  }

  resetFilter() {
    this.selectedCategory = {};
    this.category = {
      name: '',
    };
    this.childCategories = [];
    this.location = {
      name: '',
    };
    this.selectedLocation = {};
    this.childLocations = [];
    // let data = {
    //   selectedCategory: this.selectedCategory,
    //   category: this.category,
    //   childCategories: this.childCategories
    // }
    // this.viewCtrl.dismiss(data);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
  addAsset() {

  }
}
