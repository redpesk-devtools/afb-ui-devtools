import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { AFBWebSocketService, SocketStatus, AFBApi, AFBEvent } from '../../../@core/services/AFB-websocket.service';


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
  el;
  evtidx = 0;
  count: number;
  query: string = '';
  host: string = 'localhost';
  port: string = '1234';

  private _eventArray: Array<string> = [];
  private _eventSubject = <BehaviorSubject<Array<string>>>new BehaviorSubject(this._eventArray);
  wsStatus$: Observable<SocketStatus>;
  verbs$: Observable<Array<AFBApi>>;
  questions: Array<String>;
  responses: Array<object>;
  event$: Observable<Array<string>>;

  // urlws = "ws://" + window.location.host + "/api";
  // urlws = "ws://localhost:8000/api?x-afbService-token=mysecret"

  constructor(private afbService: AFBWebSocketService) {
    afbService.Init('api', 'HELLO');

  }

  ngOnInit(): void {
    this.afbService.SetURL(this.host, this.port);
    this.afbService.Connect();
    this.wsStatus$ = this.afbService.Status$;
    this.verbs$ = this.afbService.Discover();
    this.questions = [];
    this.responses = [];
    this.count = 0;
    this.event$ = this._eventSubject.asObservable();
    this.afbService.OnEvent('*').subscribe(d => {
      this._eventArray.unshift(JSON.stringify(d));
      console.log(this._eventArray);
      this._eventSubject.next(this._eventArray);
    });
  }


  callBinder(api: string, verb: string, query: string) {
    this.afbService.Send(api + verb, query).subscribe(d => {
      this.status = d.response;
      const req = this.count + ': ws://' + this.host + ':' + this.port + '/api/' + api + verb + '?query=' + query;
      this.questions.unshift(this.afbService.syntaxHighlight(req));
      const res = this.afbService.syntaxHighlight(d);
      this.responses.unshift(res);
    });
    this.count++;
  }

  // OnEvent(eventName: string) {
  //   this.afbService.OnEvent(eventName).subscribe((evt: any) => {
  //     console.log(evt);
  //   });
  //   // this.afbService.OnEvent(eventName, (evt: any) => {
  //   //   console.log(evt);
  //   // });
  // }

  closeSocket() {
    this.afbService.Disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }
}
