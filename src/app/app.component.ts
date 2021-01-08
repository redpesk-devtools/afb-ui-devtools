/**
 * @license
 * Copyright (C) 2019-2020 IoT.bzh Company
 * Contact: https://www.iot.bzh/licensing
 *
 * This file is part of the rp-webserver module of the RedPesk project.
 *
 * $RP_BEGIN_LICENSE$
 * Commercial License Usage
 *  Licensees holding valid commercial IoT.bzh licenses may use this file in
 *  accordance with the commercial license agreement provided with the
 *  Software or, alternatively, in accordance with the terms contained in
 *  a written agreement between you and The IoT.bzh Company. For licensing terms
 *  and conditions see https://www.iot.bzh/terms-conditions. For further
 *  information use the contact form at https://www.iot.bzh/contact.
 *
 * GNU General Public License Usage
 *  Alternatively, this file may be used under the terms of the GNU General
 *  Public license version 3. This license is as published by the Free Software
 *  Foundation and appearing in the file LICENSE.GPLv3 included in the packaging
 *  of this file. Please review the following information to ensure the GNU
 *  General Public License requirements will be met
 *  https://www.gnu.org/licenses/gpl-3.0.html.
 * $RP_END_LICENSE$
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
// import { AnalyticsService } from './@core/utils/analytics.service';
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
  ws: string;

  verbs$: Observable<Array<AFBApi>>;
  wsStatus$: Observable<SocketStatus>;
  bindingName$: Observable<string>;
  info$: Observable<Array<object>>;
  apiInfo: Array<object>;
  event$: Observable<Array<string>>;

  constructor(
    // private analytics: AnalyticsService,
    private iconLibraries: NbIconLibraries,
    private afbService: AFBWebSocketService,
  ) {
    this.iconLibraries.registerFontPack('font-awesome', { iconClassPrefix: 'fa' });
    this.iconLibraries.setDefaultPack('font-awesome');
    afbService.Init('api', 'HELLO');
  }

  ngOnInit() {
    // this.afbService.Init('api', 'HELLO');
    // this.analytics.trackPageViews();
    // this.afbService.SetURL(this.host, this.port);
    this.afbService.SetURL(window.location.host);
    this.afbService.Connect();
    this.wsStatus$ = this.afbService.Status$;
  }

  closeSocket() {
    this.afbService.Disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }
}
