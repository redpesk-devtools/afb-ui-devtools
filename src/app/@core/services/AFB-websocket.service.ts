import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, from, ReplaySubject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AFB } from '../afb';

export interface AFBContext {
    token: string;
    uuid: string | undefined;
}

export interface AFBEvent {
    action: string;
    event: string;
    value: string;
}

export interface SocketStatus {
    connected: boolean;
    reconnect_attempt: number;
    reconnect_failed: boolean;
}

@Injectable()
export class AFBWebSocketService {

    ws: any;
    context: AFBContext;

    wsConnect$: Observable<Event>;
    wsDisconnect$: Observable<Event>;
    Status$: Observable<SocketStatus>;
    InitDone$: Observable<boolean>;

    private _wsConnectSubject = new Subject<Event>();
    private _wsDisconnectSubject = new Subject<Event>();
    private _status = <SocketStatus>{ connected: false };
    private _statusSubject = <BehaviorSubject<SocketStatus>>new BehaviorSubject(this._status);
    private _isInitDone = <ReplaySubject<boolean>>new ReplaySubject(1);
    private afb: any;

    Init(base: string, initialToken?: string) {

        // keep it ?
        // this.context = <AFBContext>{ token: initialToken, uuid: undefined };
        this.afb = new AFB({
            base: base,
            token: initialToken
        });

        this.wsConnect$ = this._wsConnectSubject.asObservable();
        this.wsDisconnect$ = this._wsDisconnectSubject.asObservable();
        this.Status$ = this._statusSubject.asObservable();
        this.InitDone$ = this._isInitDone.asObservable();
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
            },
            // onerror
            function () {
                this._isInitDone.next(false);
                console.error('Can not open websocket');
            }
        );

        this.ws.onclose = (event: CloseEvent) => {
            this._isInitDone.next(false);
            this._NotifyServerState(false);
            this._wsDisconnectSubject.next(event);
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
    Send(method: string, params: any): Observable<any> {
        return this._isInitDone.pipe(
            filter(done => done),
            switchMap(() => {
                return from(this.ws.call(method, params)
                    .then(function (obj) {
                        return obj.response;
                    })
                );
            })
        );
    }

    /**
     * Receive data from opened websocket
     */
    Subscribe(url: string, event: AFBEvent): Observable<any> {
        // return Observable.create(
        //     observer => {
        //         this.ws.onmessage = (event: MessageEvent) => {
        //             observer.next(event);
        //         };
        //     },
        // );
        return Observable.create(
            observer => {
                this._isInitDone.pipe(
                    filter(done => done),
                    switchMap(() => {
                        return from(
                            this.ws.call(url, event)
                                .then(function (/*obj*/) {
                                    const eventId = url.split('/')[0] + '/' + (event.value ? event.value : event.event);
                                    this.ws.onevent(eventId, (event: any) => {
                                        observer.next(event.data);
                                    });
                                })
                        );
                    })
                );
            }
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

}
