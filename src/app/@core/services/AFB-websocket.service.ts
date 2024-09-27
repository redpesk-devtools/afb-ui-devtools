/**
 * @license
 * Copyright (C) 2020-2021 IoT.bzh Company
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
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, from, ReplaySubject, forkJoin } from 'rxjs';
import { filter, switchMap, map, take } from 'rxjs/operators';
import { AFB, AFBEvent, AFBReply } from '@redpesk/afb-ws';

export interface SocketStatus {
    connected: boolean;
    reconnect_attempt: number;
    reconnect_failed: boolean;
}

export interface AFBApi {
    api: string;
    title: string;
    version: string;
    description: string;
    verbs: AFBVerb[];
}

export interface AFBApis extends Array<AFBApi> { }

export interface AFBVerb {
    verb: string;
    query: string;
    description: string;
}

@Injectable()
export class AFBWebSocketService {

    conn_location?: string;
    conn_port?: string;
    wsConnect$?: Observable<Event>;
    wsDisconnect$?: Observable<Event>;
    wsEvent$?: Observable<Event>;
    Status$?: Observable<SocketStatus>;
    InitDone$?: Observable<boolean>;
    AutoReconnect$?: Observable<boolean>;
    event$?: Observable<Array<string>>;

    private ws: any;
    private _wsConnectSubject = new Subject<Event>();
    private _wsDisconnectSubject = new Subject<Event>();
    private _wsEventSubject = new Subject<Event>();
    private _status = <SocketStatus>{ connected: false };
    private _statusSubject = <BehaviorSubject<SocketStatus>>new BehaviorSubject(this._status);
    private _isInitDone = <ReplaySubject<boolean>>new ReplaySubject(1);
    private afb: any;

    constructor() {
    }


    Init(base: string, initialToken?: string) {
        this.afb = new AFB(base, initialToken);
        this.wsConnect$ = this._wsConnectSubject.asObservable();
        this.wsDisconnect$ = this._wsDisconnectSubject.asObservable();
        this.wsEvent$ = this._wsEventSubject.asObservable();
        this.Status$ = this._statusSubject.asObservable();
        this.InitDone$ = this._isInitDone.asObservable();
    }

    SetURL(location: string, port?: string) {
        this.conn_location = location;
        this.conn_port = port;
        this.afb.setURL(location, port);
    }

    GetUrl(): string {
        return this.conn_location + (this.conn_port ? ':' + this.conn_port : '');
    }

    Connect(): Error {

        // Establish websocket connection
        this.ws = new this.afb.ws(
            //  onopen
            (event: Event) => {
                this._NotifyServerState(true);
                this._wsConnectSubject.next(event);
                this._isInitDone.next(true);
            },
            // onerror
            () => {
                this._isInitDone.next(false);
                console.error('Can not open websocket');
            }
        );

        this.ws.onclose = (event: CloseEvent) => {
            this._isInitDone.next(false);
            this._NotifyServerState(false);
            this._wsDisconnectSubject.next(event);
        };
        return new Error('Websocket connection failed');
    }


    Disconnect() {
        // TODO : close all subjects
        this._NotifyServerState(false);
        this.ws.close();
    }

    /**
     * Send data to the ws server
     */
    Send(method: string, params: object | string): Observable<any> {
        const param = this.CheckQuery(params);
        return this._isInitDone.pipe(
            filter(done => done),
            switchMap(() => {
                return from(this.ws.call(method, param)
                    .then((obj: AFBReply) => {
                        return obj;
                    },
                    ).catch((err: AFBReply) => {
                        return (err);
                    },
                    )
                );
            }),
            take(1),
        );
    }

    CheckIfJson(str: string): boolean {
        if (str === undefined || str === '' || !str.trim().length) {
            return true;
        }
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    CheckQuery(params: object | string) {
        if (!params || params === undefined || (typeof params === 'string' && this.CheckIfJson(params) === false))
            params = '{}';
        return typeof params === 'string' ? JSON.parse(params) : params;
    }

    syntaxHighlight(json: any) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match: string) {
                let cls = 'text-info';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'text-primary';
                    } else {
                        cls = 'text-success';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'text-danger';
                } else if (/null/.test(match)) {
                    cls = 'text-warning';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
    }

    /**
     * Receive data from opened websocket
     */
    OnEvent(eventName: string): Observable<AFBEvent> {
        // Convert websocket Event based on callback to an Observable
        return Observable.create(
            (            observer: { next: (arg0: AFBEvent) => void; }) => {
                this.ws.onevent(eventName, (event: AFBEvent) => {
                    observer.next(event);
                });
            },
        );
    }


    private _NotifyServerState(connected: boolean, attempt?: number) {
        this._status.connected = connected;
        if (connected) {
            this._status.reconnect_failed = false;
        }
        this._statusSubject.next(Object.assign({}, this._status));
    }

    getInfoVerbs(): Observable<Array<object>> {
        return this.getApis().pipe(
            map((data) => {
                const tasks$: Observable<{ api: string; info: any; } | undefined>[] = [];
                data.forEach(api => {
                    tasks$.push(this.Send(api + '/info', {}).pipe(
                        map(d => {
                            if (d.response) {
                                return { 'api': api, 'info': d.response };
                            } else {
                                return undefined;
                            }
                        })
                    ));
                });
                return forkJoin(...tasks$);
            }),
            switchMap(res => {
                return res;
            })
        );
    }

    getApis(): Observable<Array<string>> {
        return this.Send('monitor/get', { 'apis': false }).pipe(
            map(data => {
                const apis: Array<string> = [];
                const keys = Object.keys(data.response.apis);
                const results = keys.map(key => ({ key: key, value: data.response.apis[key] }));
                results.forEach(value => {
                    if (value.key !== 'monitor') {
                        apis.push(value.key);
                    }
                });
                return apis;
            })
        );
    }

    Discover(): Observable<AFBApis> {
        return this.Send('monitor/get', { 'apis': true }).pipe(
            map(data => {
                return this._GetAFBApis(data.response);
            })
        );
    }

    private _GetAFBApis(data: any) {
        const Apis: AFBApis = [];
        const keys = Object.keys(data.apis);
        const results = keys.map(key => ({ key: key, value: data.apis[key] }));
        results.forEach(value => {
            if (value.key !== 'monitor') {
                const AFBVerbs2 = this._GetAFBVerbs(value);
                const api = <AFBApi>{
                    api: value.key,
                    title: value.value.info.title,
                    version: value.value.info.version,
                    description: value.value.info.description,
                    verbs: AFBVerbs2,
                };
                Apis.push(api);
            }
        });
        return Apis;
    }

    private _GetAFBVerbs(value: any) {
        const AFBVerbs: Array<AFBVerb> = [];
        const verbs = Object.keys(value.value.paths);
        const paths = verbs.map(path => ({ path: path, verb: value.value.paths[path] }));
        paths.forEach(path => {
            const verb = <AFBVerb>{
                verb: path.path,
                query: '',
                description: path.verb.get.responses[200].description,
            };
            AFBVerbs.push(verb);
        });
        return AFBVerbs;
    }
}
