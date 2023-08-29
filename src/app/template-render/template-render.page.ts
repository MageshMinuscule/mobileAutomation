import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Events } from 'src/providers/events/events';
import { TemplateProvider } from 'src/providers/template/template';

@Component({
  selector: 'app-template-render',
  templateUrl: './template-render.page.html',
  styleUrls: ['./template-render.page.scss'],
})
export class TemplateRenderPage implements OnInit,AfterViewInit {

  @Input('templateForm') templateForm:any 
  @Input('selectedRequest') selectedRequest:any 
  @Input('type') type:any 
  @Input('buttons') buttons:any 
  @Input('templatedata') templatedata:any 
  @Input('requestData') requestData:any 
  @Input('draftRequest') draftRequest:any
  @Input('form') form:any
  @Input('isDraft') isDraft:any
  @Input('workRequest') workRequest:any;
  @Input('requestTimer') requestTimer:any;
  @Input('isChange') isChange:boolean = false;
  formSection: any = {};
  nextSection: any = [];
  nextCount = 0;
  constructor(public templateProvider: TemplateProvider,
    public events: Events
    ) {
  }

  ngOnInit() {
    this.events.subscribe('template:render', (data:any) => {
      console.log("template render: ",data)
      this.templatedata = data.data.templateSchema;
      this.requestData = data.data.requestData;
      this.selectedRequest = data.data.draftRequest;
      this.type = data.data.reqType;
      this.buttons = this.templatedata.buttons;

    });
  }
  ngOnChanges(changes) {
    console.log("template render: ",changes)
  }
  splitFormSections(form: any) {
    for (const obj of this.keys(form)) {
      // console.log(obj)
      for (const key of this.keys(form[obj])) {
        // console.log(key)
        if (form[obj][key].type === 'hasNext' && !form[obj][key].hasNext) {
          // console.log(form[obj][key].type)
          this.formSection[obj] = form[obj];
        } else if (form[obj][key].type === 'hasNext' && form[obj][key].hasNext) {
          const nextSection = {};
          nextSection[obj] = form[obj];
          this.nextSection.push(nextSection);
        }
      }
    }
    this.templateForm = Object.keys(this.formSection).length ? this.formSection : this.templateForm;
    // console.log(this.templateForm);
  }

  ngAfterViewInit(): void {
    // console.log('temaplte form'+ JSON.stringify(this.templateForm));
    if(this.templateForm) this.splitFormSections(this.templateForm);
  }

  showNext() {
    if (this.templateProvider.validateForm(this.formSection)) {
      this.formSection = this.nextSection[this.nextCount];
      this.templateForm = this.formSection;
      this.nextCount++;
    }
  }

  keys(obj) {
    // console.log(Object.keys(obj))
    return Object.keys(obj);
    
  }


}
