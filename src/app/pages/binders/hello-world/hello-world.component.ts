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


import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, Observable, BehaviorSubject, Subject } from 'rxjs';
import { AFBWebSocketService, SocketStatus, AFBApi } from '../../../@core/services/AFB-websocket.service';
import { NbToastrService } from '@nebular/theme';


@Component({
  selector: 'rp-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HelloWorldComponent implements OnInit, OnDestroy {

  dataFromServer: string;
  wsSubscription: Subscription;
  status;
  evtidx = 0;
  count: number;
  query: Array<Array<Array<string>>> = [[[]]];
  host: string = 'localhost';
  port: string = '1234';

  private _eventArray: Array<string> = [];
  private _eventSubject = <BehaviorSubject<Array<string>>>new BehaviorSubject(this._eventArray);
  private _questionsSubject = new Subject<Array<String>>();
  private _responsesSubject = new Subject<Array<Array<String>>>();
  private _infoSubject = <BehaviorSubject<Array<object>>>new BehaviorSubject([]);
  wsStatus$: Observable<SocketStatus>;
  verbs$: Observable<Array<AFBApi>>;
  info$: Observable<Array<object>>;
  questions$: Observable<Array<String>>;
  responses$: Observable<Array<Array<String>>>;
  questions: Array<String>;
  responses: Array<Array<String>>;
  event$: Observable<Array<string>>;
  apiInfo: Array<object>;

  constructor(
    private afbService: AFBWebSocketService,
    private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.wsStatus$ = this.afbService.Status$;
    this.verbs$ = this.afbService.Discover();
    this.apiInfo = [];
    this.questions = [];
    this.responses = [];
    this.getInfoVerbs();
    this.info$ = this._infoSubject.asObservable();
    this.questions$ = this._questionsSubject.asObservable();
    this.responses$ = this._responsesSubject.asObservable();
    this.count = 0;
    this.event$ = this._eventSubject.asObservable();
    this.afbService.OnEvent('*').subscribe(d => {
      this._eventArray.unshift(this.evtidx + ' : ' + this.afbService.syntaxHighlight(d));
      this.evtidx++;
      this._eventSubject.next(this._eventArray);
    });
  }

  getInfoVerbs() {
    this.afbService.Discover().subscribe(data  => {
        data.forEach(api => {
          if (api.verbs.find(d => d.verb === '/info')) {
            this.afbService.Send(api.api + '/info', {}).subscribe(d => {
                  this.apiInfo.push({ 'api': api.api, 'info' : d.response});
                  this._infoSubject.next(this.apiInfo);
                });
          }
        });
      }
    );
  }

  isAdvanced(info: any, verb: string): Boolean {
    info.groups.forEach(group => {
      if (group.verbs.find(d => d.uid === verb || d.verb === verb)) {
        return false;
      }
    });
    return true;
  }

  hasAdvancedVerbs() {

  }

  callBinder(api: string, verb: string, query: string) {
    if (verb.charAt(0) === '/') {
      verb = verb.substring(1);
    }
    query = query.split(' ').join('');
    if (this.afbService.CheckIfJson(query) === true) {
      this.afbService.Send(api + '/' + verb, query).subscribe(d => {
        this.status = d.response;
        const req = this.count + ': ws://' + this.host + ':' + this.port + '/api/' + api + '/' + verb + '?query=' + query;
        this.questions.unshift(this.afbService.syntaxHighlight(req));
        this._questionsSubject.next(this.questions);
        const res = [this.count + ': OK :' + this.afbService.syntaxHighlight(d)];
        this.responses.unshift(res);
        this._responsesSubject.next(this.responses);
        this.count++;
      });
    } else {
      this.toastrService.show('Invalid parameters: should be JSON type. Minimum query: {}. Use ""');
    }
  }

  setQuery(i: any, j: any, k: any) {
    if (!this.query[i]) {
      this.query[i] = [];
    }
    if (!this.query[i][j]) {
      this.query[i][j] = [];
    }
    if (!this.query[i][j][k]) {
      this.query[i][j][k] = '';
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

  closeSocket() {
    this.afbService.Disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }
}
