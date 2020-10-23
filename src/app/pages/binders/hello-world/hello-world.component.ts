import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { AFBWebSocketService, SocketStatus, AFBApi } from '../../../@core/services/AFB-websocket.service';


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
  Gwen = 'angular';
  evtidx = 0;
  count: number;
  query: string = '';
  host: string = 'localhost';
  port: string = '1234';

  wsStatus$: Observable<SocketStatus>;
  verbs$: Observable<Array<AFBApi>>;
  events$: Observable<Event>;
  questions: Array<String>;
  responses: Array<object>;
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
  }


  callBinder(api, verb, query) {
    this.afbService.Send(api + verb, query).subscribe(d => {
          this.status = d.response;
          this.questions.unshift(this.count + ': ws://' + this.host + ':' + this.port + '/api/' + api + verb + '?query=' + query);
          this.responses.unshift(d);
        });
        this.count++;
  }

  closeSocket() {
    this.afbService.Disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }
}
