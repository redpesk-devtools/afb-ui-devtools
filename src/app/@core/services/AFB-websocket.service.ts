import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, from, ReplaySubject } from 'rxjs';
import { filter, switchMap, map } from 'rxjs/operators';
import { AFB } from '../afb';

export interface AFBContext {
    token: string;
    uuid: string | undefined;
}

export interface AFBEvent {
    jtype: string;
    event: string;
    data: any;
}



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

// export interface AFBApis AFBApi[];

export interface AFBVerb {
    verb: string;
    query: string;
    description: string;
}

@Injectable()
export class AFBWebSocketService {

    ws: any;
    context: AFBContext;

    wsConnect$: Observable<Event>;
    wsDisconnect$: Observable<Event>;
    wsEvent$: Observable<Event>;
    Status$: Observable<SocketStatus>;
    InitDone$: Observable<boolean>;

    private _wsConnectSubject = new Subject<Event>();
    private _wsDisconnectSubject = new Subject<Event>();
    private _wsEventSubject = new Subject<Event>();
    private _status = <SocketStatus>{ connected: false, reconnect_attempt: 0 };
    private _statusSubject = <BehaviorSubject<SocketStatus>>new BehaviorSubject(this._status);
    private _isInitDone = <ReplaySubject<boolean>>new ReplaySubject(1);
    private afb: any;
    response: any;

    Init(base: string, initialToken?: string) {

        // keep it ?
        // this.context = <AFBContext>{ token: initialToken, uuid: undefined };
        this.afb = new AFB({
            base: base,
            token: initialToken
        });

        this.wsConnect$ = this._wsConnectSubject.asObservable();
        this.wsDisconnect$ = this._wsDisconnectSubject.asObservable();
        this.wsEvent$ = this._wsEventSubject.asObservable();
        this.Status$ = this._statusSubject.asObservable();
        this.InitDone$ = this._isInitDone.asObservable();
        this.response = {};
    }

    SetURL(location: string, port?: string) {
        this.afb.setURL(location, port);
    }

    Connect(): Error {

        // Establish websocket connection
        this.ws = new this.afb.ws(
            //  onopen
            (event: Event) => {
                this._NotifyServerState(true);
                this._wsConnectSubject.next(event);
                this._isInitDone.next(true);
                this._status.reconnect_attempt = 0;
                // this._wsEventSubject.next(this.ws.onevent('*', this.Log(event)));
            },
            // onerror
            () => {
                this._isInitDone.next(false);
                console.error('Can not open websocket');
            }
        );

        this.ws.onclose = (event: CloseEvent) => {
            console.error(this._status.reconnect_attempt);
            this._isInitDone.next(false);
            this._wsDisconnectSubject.next(event);
            if (this._status.reconnect_attempt < 100) {
                this._status.reconnect_attempt++;
                setTimeout(() => {
                    this._NotifyServerState(false, this._status.reconnect_attempt);
                    this.Connect();
                }, 1000);
            } else {
                console.error('Reconnection failed. Please make sure your binding is running');
            }
        };
        return null;
    }

    Disconnect() {
        // TODO : close all subjects
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
                    .then((obj) => {
                            return obj;
                        },
                    ).catch((err) => {
                        return (err);
                    },
                    )
                );
            })
        );
    }

    CheckQuery(params: object | string) {
        if (!params || params === ' ')
            params = {};
        return typeof params === 'string' ? JSON.parse(params) : params;
    }

    syntaxHighlight(json: any) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
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
            observer => {
                this.ws.onevent(eventName, (event: AFBEvent) => {
                    observer.next(event);
                });
            },
        );
    }


    private _NotifyServerState(connected: boolean, attempt?: number) {
        this._status.connected = connected;
        if (attempt !== null) {
            this._status.reconnect_attempt = attempt;
        }
        if (connected) {
            this._status.reconnect_attempt = 0;
            this._status.reconnect_failed = false;
        }
        this._statusSubject.next(Object.assign({}, this._status));
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
