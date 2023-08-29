import { Component, Input, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-asset-popover',
  templateUrl: './asset-popover.component.html',
  styleUrls: ['./asset-popover.component.scss'],
})
export class AssetPopoverComponent implements OnInit {
  @Input() moduleName:any
  constructor(
    private popoverController: PopoverController,
  ) {
  }

  ngOnInit() {}

  selectOption(item: string) {
    this.popoverController.dismiss(item);
  }

}
