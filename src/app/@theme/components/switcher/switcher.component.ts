import { Component, Input, input, output } from '@angular/core';

@Component({
    selector: 'ngx-switcher',
    styleUrls: ['./switcher.component.scss'],
    template: `
    <label class="switch-label" [class.vertical]="vertical()">
      <span class="first" [class.active]="vertical() || isFirstValue()">
        {{vertical() ? currentValueLabel() : firstValueLabel()}}
      </span>
    
      <div class="switch">
        <input type="checkbox" [checked]="isSecondValue()" (change)="changeValue()">
        <span class="slider"></span>
      </div>
    
      @if (!vertical()) {
        <span
          class="second"
          [class.active]="isSecondValue()">
          {{secondValueLabel()}}
        </span>
      }
    </label>
    `
})
export class SwitcherComponent {
  readonly firstValue = input<any>(undefined);
  readonly secondValue = input<any>(undefined);

  readonly firstValueLabel = input<string>(undefined);
  readonly secondValueLabel = input<string>(undefined);

  readonly vertical = input<boolean>(undefined);

  @Input() value: any;
  readonly valueChange = output<any>();

  isFirstValue() {
    return this.value === this.firstValue();
  }

  isSecondValue() {
    return this.value === this.secondValue();
  }

  currentValueLabel() {
    return this.isFirstValue()
      ? this.firstValueLabel()
      : this.secondValueLabel();
  }

  changeValue() {
    this.value = this.isFirstValue()
      ? this.secondValue()
      : this.firstValue();

    this.valueChange.emit(this.value);
  }
}
