import { Injectable } from '@angular/core';
import { Observable, Subject, of, throwError, BehaviorSubject } from 'rxjs';
// import { webSocket, WebSocketSubjectConfig, WebSocketSubject } from 'rxjs/webSocket';
// import { map } from 'rxjs/operators';

export interface AFBContext {
    token: string;
    uuid: string | undefined;
}

@Injectable()
export class AFBWebSocketService {

    ws: WebSocket;
    // wsRx: WebSocketSubject<any>;
    context: AFBContext;

    wsConnect$: Observable<Event>;
    wsConnected$: Observable<Boolean>;
    wsDisconnect$: Observable<Event>;

    private PROTO1 = 'x-afb-ws-json1';
    private _wsConnectSubject = new Subject<Event>();
    private _wsConnectedSubject = new BehaviorSubject<Boolean>(false);
    private _wsDisconnectSubject = new Subject<Event>();

    private counter = 0;
    private readonly CALL = 2;
    private base;
    // private readonly RETOK = 3;
    // private readonly RETERR = 4;
    // private readonly EVENT = 5;

    private urlws: string;
    urlwspub: string;
    connected: string;

    init(base: string, initialtoken?: string) {

        this.base = base;
        this.context = <AFBContext>{ token: initialtoken, uuid: undefined};

        this.setURL(window.location.host);

        this.wsConnect$ = this._wsConnectSubject.asObservable();
        this.wsConnected$ = this._wsConnectedSubject.asObservable();
        this.wsDisconnect$ = this._wsDisconnectSubject.asObservable();
    }

    setURL(location: string, port?: number) {
        this.urlws = 'ws://' + location;
        if (port) {
            this.urlws += ':' + String(port);
        }
        this.urlws += '/' + this.base;
        this.urlwspub = this.urlws;
        if (this.context.token)
            this.urlws = this.urlws + '?x-afb-token=' + this.context.token;
    }

    connect(): Error {
        this.ws = new WebSocket(this.urlws, [this.PROTO1]);
        // this.wsRx = webSocket({
        //     url: this.urlws,
        //     protocol: [this.PROTO1]
        // });
        this.ws.onopen = (event: Event) => {

            console.log('Opened Socket');
            console.log('test', event);
            this._wsConnectedSubject.next(true);
            this._wsConnectSubject.next(event);
        };
        this.ws.onerror = (event) => console.log('err');
        this.ws.onclose = (event: CloseEvent) => {
            console.log('Closed socket');
            this._wsConnectedSubject.next(false);
            this._wsDisconnectSubject.next(event);
        };
        return null;
    }

    disconnect() {
        // TODO : close all subjects
    }

    /**
     * Send data to the ws server
     */
    Send(method: string, request: any): Observable<any> {
        return Observable.create(
            observer => {
                if (this.ws.readyState !== 1) {
                    return throwError('socketnotready');
                }
                let id, arr;
                // do {
                id = String(this.counter = 4095 & (this.counter + 1));
                // } while (id in this.pendings);
                // this.pendings[id] = [resolve, reject];
                arr = [this.CALL, id, method, request];
                if (this.context.token) arr.push(this.context.token);
                console.log('afb:' ,arr);
                this.ws.send(JSON.stringify(arr));
                this.ws.onmessage = (event: MessageEvent) => {
                    observer.next(event);
                };
            });
        // let id, arr;
        // //do {
        // id = String(this.counter = 4095 & (this.counter + 1));
        // // } while (id in this.pendings);
        // // this.pendings[id] = [resolve, reject];
        // arr = [this.CALL, id, method, request];
        // if (this.context.token) arr.push(this.context.token);
        // console.log(arr);
        // this.wsRx.next(JSON.stringify(arr));
        // return this.wsRx.multiplex(
        //     () => {},
        //     () => {},
        //     message => message.type === "id"
        // ).pipe(map(message => message.message));
    }

    /**
     * Receive data from opened websocket
     */
    Receive(): Observable<any> {
        return Observable.create(
            observer => {
                this.ws.onmessage = (event: MessageEvent) => {
                    observer.next(event);
                };
            },
        );
    }
}
