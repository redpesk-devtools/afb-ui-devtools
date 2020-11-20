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
  el;
  evtidx = 0;
  count: number;
  query: Array<Array<string>> = [[]];
  host: string = 'localhost';
  port: string = '1234';

  private _eventArray: Array<string> = [];
  private _eventSubject = <BehaviorSubject<Array<string>>>new BehaviorSubject(this._eventArray);
  private _questionsSubject = new Subject<Array<String>>();
  private _responsesSubject = new Subject<Array<Array<String>>>();
  wsStatus$: Observable<SocketStatus>;
  verbs$: Observable<Array<AFBApi>>;
  questions$: Observable<Array<String>>;
  responses$: Observable<Array<Array<String>>>;
  questions: Array<String>;
  responses: Array<Array<String>>;
  event$: Observable<Array<string>>;

  constructor(private afbService: AFBWebSocketService,
    private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.wsStatus$ = this.afbService.Status$;
    this.verbs$ = this.afbService.Discover();
    this.questions = [];
    this.responses = [];
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

  callBinder(api: string, verb: string, query: string) {
    if (this.afbService.CheckIfJson(query) === true) {
      this.afbService.Send(api + verb, query).subscribe(d => {
        this.status = d.response;
        const req = this.count + ': ws://' + this.host + ':' + this.port + '/api/' + api + verb + '?query=' + query;
        this.questions.unshift(this.afbService.syntaxHighlight(req));
        this._questionsSubject.next(this.questions);
        const res = [this.count + ': OK :' + this.afbService.syntaxHighlight(d)];
        this.responses.unshift(res);
        this._responsesSubject.next(this.responses);
        this.count++;
      });
    } else {
      this.toastrService.show('Invalid parameters: should be JSON type. Minimum query: {}');
    }
  }

  setQuery(i: any, j: any) {
    if (!this.query[i]) {
      this.query[i] = [];
    }
    if (!this.query[i][j]) {
      this.query[i][j] = '{}';
    }
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
