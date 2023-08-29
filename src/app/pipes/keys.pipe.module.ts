import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeysPipe } from './keys.pipe';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    KeysPipe
  ],
  declarations: [
    KeysPipe
  ]
})
export class KeysPipeModule { }