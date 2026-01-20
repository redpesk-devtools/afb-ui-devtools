/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { enableProdMode, importProvidersFrom } from '@angular/core';


import { environment } from './environments/environment';
import { AFBWebSocketService } from './app/@core/services/AFB-websocket.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';
import { ThemeModule } from './app/@theme/theme.module';
import { NbSidebarModule, NbMenuModule, NbDatepickerModule, NbDialogModule, NbWindowModule, NbToastrModule, NbLayoutModule, NbTooltipModule } from '@nebular/theme';
import { CoreModule } from './app/@core/core.module';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, AppRoutingModule, ThemeModule.forRoot(), NbSidebarModule.forRoot(), NbMenuModule.forRoot(), NbDatepickerModule.forRoot(), NbDialogModule.forRoot(), NbWindowModule.forRoot(), NbToastrModule.forRoot(), NbLayoutModule, NbTooltipModule, CoreModule.forRoot()),
    AFBWebSocketService,
    provideHttpClient(withInterceptorsFromDi())
  ]
})
  .catch(err => console.error(err));
