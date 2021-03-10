/**
 * @license
 * Copyright (C) 2019-2021 IoT.bzh Company
 * Contact: https://www.iot.bzh/licensing
 *
 * This file is part of the afb-ui-devtools module of the redpesk® project.
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

import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
// import { DOCUMENT } from '@angular/common';
import { Subscription, Observable, BehaviorSubject, Subject } from 'rxjs';
import { AFBWebSocketService, SocketStatus, AFBApi } from '../../../@core/services/AFB-websocket.service';
import { NbToastrService } from '@nebular/theme';
import { map } from 'rxjs/operators';


@Component({
  selector: 'rp-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CoreComponent implements OnInit, OnDestroy {

  dataFromServer: string;
  wsSubscription: Subscription;
  evtidx: number;
  count: number;
  query: Array<Array<Array<string>>> = [[[]]];
  host: string = 'localhost';
  port: string = '1234';

  private _eventArray: Array<string> = [];
  private _eventSubject = <BehaviorSubject<Array<string>>>new BehaviorSubject(this._eventArray);
  private _questionsSubject = new Subject<Array<String>>();
  private _responsesSubject = new Subject<Array<Array<string>>>();
  wsStatus$: Observable<SocketStatus>;
  verbs$: Observable<Array<AFBApi>>;
  info$: Observable<Array<object>>;
  questions$: Observable<Array<String>>;
  responses$: Observable<Array<Array<string>>>;
  questions: Array<String>;
  responses: Array<Array<string>>;
  raw_questions: Array<String>;
  raw_responses: Array<Array<string>>;
  raw_events: Array<string> = [];
  event$: Observable<Array<string>>;
  info: Array<object>;
  connected = true;
  initEvents$: Observable<any>;

  constructor(
    // @Inject(DOCUMENT) private document: Document,
    private afbService: AFBWebSocketService,
    private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.wsStatus$ = this.afbService.Status$;
    this.verbs$ = this.afbService.Discover();
    this.afbService.getApis();
    this.questions = [];
    this.responses = [];
    this.info$ = this.afbService.getInfoVerbs();
    this.questions$ = this._questionsSubject.asObservable();
    this.responses$ = this._responsesSubject.asObservable();
    this.count = 0;
    this.evtidx = 0;
    this.event$ = this._eventSubject.asObservable();
    this.initEvents$ = this.afbService.OnEvent('*').pipe(map(d => {
      this._eventArray.unshift(this.evtidx + ' : ' + this.afbService.syntaxHighlight(d));
      this.evtidx++;
      this._eventSubject.next(this._eventArray);
    }));
  }

  checkInfo(info: Array<Object>): boolean {
    let hasInfo = false;
    info.forEach(infoverb => {
      if (infoverb !== undefined) {
        hasInfo = true;
      }
    }, hasInfo);
    return hasInfo;
  }

  callBinder(api: string, verb: string, query: string, connected: boolean) {
    if (connected === true) {
      if (verb.charAt(0) === '/') {
        verb = verb.substring(1);
      }
      query = query.split(' ').join('');
      if (this.afbService.CheckIfJson(query) === true) {
        this.afbService.Send(api + '/' + verb, query).subscribe(d => {
          let req = this.count + ': ws://' + this.afbService.GetUrl() + '/api/' + api + '/' + verb;
          if (query && query.trim().length > 0) {
            req += '?query=' + query;
          }
          this.questions.unshift(this.afbService.syntaxHighlight(req));
          this._questionsSubject.next(this.questions);
          const outcome = (d.request.status === 'success') ? ': OK :' : ': ERROR :';
          const res = [this.count + outcome + this.afbService.syntaxHighlight(d)];
          this.responses.unshift(res);
          this._responsesSubject.next(this.responses);
          this.count++;
        });
      } else {
        this.toastrService.show('Invalid parameters: should be JSON type. Minimum query: {}. Use ""');
      }
    } else {
      this.toastrService.show('Websocket or binding disconnected, request unsendable');
    }
  }

  setQuery(i: any, j: any, k: any, call: string) {
    if (!this.query[i]) {
      this.query[i] = [];
    }
    if (!this.query[i][j]) {
      this.query[i][j] = [];
    }
    if (!this.query[i][j][k]) {
      if (call === 'info') {
      this.query[i][j][k] = '';
      } else {
        this.query[i][j][k] = '{}';
      }
    }
  }

  getAction(action: string) {
    return `{"action": "${action}"}`;
  }

  getUsage(verb: any, usage: any): string {
    const data: string = !verb ? JSON.stringify(usage) : (!verb.data ? JSON.stringify(usage) : JSON.stringify(verb.data));
    return data;
  }

  getExample(verb: any): string {
    const example: string = JSON.stringify(verb);
    return example;
  }

  resetResponses() {
    this.responses = [];
    this._responsesSubject.next(this.responses);
  }

  resetQuestions() {
    this.questions = [];
    this._questionsSubject.next(this.questions);
  }

  resetEvents() {
    this._eventArray = [];
    this._eventSubject.next(this._eventArray);
  }

  copyToClipboard(text) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    const d = document.createElement('div');
    d.innerHTML = text;
    text = d.innerText.replace(/([,])([\S])/g, '$1\n$2');
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }

  closeSocket() {
    this.afbService.Disconnect();
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }
}
