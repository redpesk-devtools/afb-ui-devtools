/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { NbIconLibraries } from '@nebular/theme';
import { VerbsService } from './@core/services/verbs.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  verbs: any[];
  constructor(
    private analytics: AnalyticsService,
    private iconLibraries: NbIconLibraries,
    private verbsService: VerbsService,
  ) {
    this.iconLibraries.registerFontPack('font-awesome', { iconClassPrefix: 'fa' });
    this.iconLibraries.setDefaultPack('font-awesome');
  }

  ngOnInit() {
    this.analytics.trackPageViews();
    this.verbs = this.verbsService.verbs;
  }
}
