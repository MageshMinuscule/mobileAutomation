import { Component, OnInit , Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { JobListPage } from '../job-list/job-list.page';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.page.html',
  styleUrls: ['./jobs-list.page.scss'],
})
export class JobsListPage implements OnInit {


@Input('incident') incident : any = {};
@Input('name') name: any;

  constructor() {}

  ngOnInit() {
  }

}



