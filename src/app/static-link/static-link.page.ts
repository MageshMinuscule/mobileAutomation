import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-static-link',
  templateUrl: './static-link.page.html',
  styleUrls: ['./static-link.page.scss'],
})
export class StaticLinkPage implements OnInit {
@Input('incident') incident : any
@Input('name ') name : any
  constructor() { }

  ngOnInit() {
  }
  openLink(url) {
    window.open(url, '_system', 'location=yes');
  }
}
