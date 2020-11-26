/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { NbIconLibraries } from '@nebular/theme';
import { Subscription, Observable } from 'rxjs';
import { AFBWebSocketService, SocketStatus, AFBApi } from './@core/services/AFB-websocket.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, OnDestroy {
  verbs: any[];
  dataFromServer: string;
  wsSubscription: Subscription;
  status;
  host: string = 'localhost';
  port: string = '1234';
  verbs$: Observable<Array<AFBApi>>;
  wsStatus$: Observable<SocketStatus>;

  constructor(
    private analytics: AnalyticsService,
    private iconLibraries: NbIconLibraries,
    private afbService: AFBWebSocketService,
  ) {
    this.iconLibraries.registerFontPack('font-awesome', { iconClassPrefix: 'fa' });
    this.iconLibraries.setDefaultPack('font-awesome');
    afbService.Init('api', 'HELLO');
  }

  ngOnInit() {
    this.analytics.trackPageViews();
    this.afbService.SetURL(this.host, this.port);
    this.afbService.Connect();
    this.wsStatus$ = this.afbService.Status$;
    this.afbService.Discover().subscribe(
      (verbs) => {
        this.verbs = verbs;
    }, (err) => {
        console.error(err);
    });
  }

  closeSocket() {
    this.afbService.Disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }
}
