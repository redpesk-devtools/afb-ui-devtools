import { Component, ElementRef, output, viewChild } from '@angular/core';

@Component({
    selector: 'ngx-search-input',
    styleUrls: ['./search-input.component.scss'],
    template: `
    <i class="control-icon ion ion-ios-search"
       (click)="showInput()"></i>
    <input placeholder="Type your search request here..."
           #input
           [class.hidden]="!isInputShown"
           (blur)="hideInput()"
           (input)="onInput($event)">
  `
})
export class SearchInputComponent {
  readonly input = viewChild<ElementRef>('input');

  readonly search = output<string>();

  isInputShown = false;

  showInput() {
    this.isInputShown = true;
    this.input().nativeElement.focus();
  }

  hideInput() {
    this.isInputShown = false;
  }

  onInput(val: string) {
    this.search.emit(val);
  }
}
