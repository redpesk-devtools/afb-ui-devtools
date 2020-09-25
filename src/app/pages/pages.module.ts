import { NgModule } from '@angular/core';
import { NbMenuModule, NbLayoutModule } from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { BindersModule  } from './binders/binders.module';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbLayoutModule,
    DashboardModule,
    BindersModule,
  ],
  declarations: [
    PagesComponent,
  ],
})
export class PagesModule {
}
