import { NgModule } from '@angular/core';

import { ThemeModule } from '../../@theme/theme.module';
import { HelloWorldComponent } from './hello-world/hello-world.component';
import { NbCardModule, NbButtonModule } from '@nebular/theme';

@NgModule({
  imports: [
    NbCardModule,
    ThemeModule,
    NbButtonModule,
  ],
  declarations: [
    HelloWorldComponent,
  ],
})
export class BindersModule { }
