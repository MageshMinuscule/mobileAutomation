import { Component, Input, OnInit } from '@angular/core';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-hyper-link',
  templateUrl: './hyper-link.page.html',
  styleUrls: ['./hyper-link.page.scss'],
})
export class HyperLinkPage implements OnInit {
@Input('incident') incident : any
@Input('name') name : any
  constructor(
    public common : CommonProvider
  ) { }

  ngOnInit() {
  }

}
