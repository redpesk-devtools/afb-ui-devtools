import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">Developped by <b><a href="https://iot.bzh" target="_blank">IoT.bzh</a></b> 2019</span>
  `,
})
export class FooterComponent {
}
