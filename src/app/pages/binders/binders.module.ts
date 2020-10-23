import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { HelloWorldComponent } from './hello-world/hello-world.component';
import { NbCardModule, NbButtonModule, NbAccordionModule, NbInputModule, NbIconModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    NbCardModule,
    ThemeModule,
    NbButtonModule,
    NbAccordionModule,
    NbIconModule,
    NbInputModule,
    FormsModule,
  ],
  declarations: [
    HelloWorldComponent,
  ],
})
export class BindersModule { }
