import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.page.html',
  styleUrls: ['./checkbox.page.scss'],
})
export class CheckboxPage implements OnInit {

  indeterminateState: boolean;
  checkParent: boolean;
  Checkboxes: any;

  constructor() {
    this.Checkboxes = [
      {
        value: "Captain Marvel",
        isItemChecked: false
      }, {
        value: "Thor",
        isItemChecked: false
      }, {
        value: "Iron Man",
        isItemChecked: false
      }, {
        value: "Spider Man",
        isItemChecked: false
      }, {
        value: "Loki",
        isItemChecked: false
      }
    ];
  }

  checkCheckbox($event) {
    setTimeout(() => {
      this.Checkboxes.forEach(item => {
        item.isItemChecked = this.checkParent;
      });
    });
  }

  verifyEvent() {
    const allItems = this.Checkboxes.length;
    let selected = 0;

    this.Checkboxes.map(item => {
      if (item.isItemChecked) selected++;
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
  }
  ngOnInit() {
  }

}
