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
  count = 0;


  wsStatus$: Observable<SocketStatus>;
  verbs$: Observable<Array<AFBApi>>;
  // urlws = "ws://" + window.location.host + "/api";
  // urlws = "ws://localhost:8000/api?x-afbService-token=mysecret"


  constructor(private afbService: AFBWebSocketService) {
    afbService.Init('api', 'HELLO');
    // console.log('onConstruct', this.apiVerbs);
    // this.verbsService = verbsService;
    // this.verbs = this.apiVerbs;
    // console.log('verbs', this.verbs);
  }

  ngOnInit(): void {
    this.afbService.SetURL('localhost', '1234');
    this.afbService.Connect();
    this.wsStatus$ = this.afbService.Status$;
    this.verbs$ = this.afbService.Discover();
  }

  callBinder(api, verb, query) {
    this.status = this.afbService.Send(api + '/' + verb, query).subscribe(d => {
      // console.log('data ', d);
    });
  }

  // this.apiVerbs = this.afbService.Discover(d);
  //   const keys = Object.keys(d.apis);
  //   const array = keys.map(key => ({ key: key, value: d.apis[key] }));
  //   console.log('array',array);
  //   array.forEach(value => {
  //     if (value.key !== 'monitor') {
  //         this.apiVerbs.push(value);
  //       }
  //     });
  // });
  // this.status = this.afbService.Send('monitor/get', {'apis': true}).subscribe(d => {
  //   const keys = Object.keys(d.apis);
  //   const array = keys.map(key => ({ key: key, value: d.apis[key] }));
  //   console.log('array',array);
  //   array.forEach(value => {
  //     if (value.key !== 'monitor') {
  //         this.apiVerbs.push(value);
  //       }
  //     });
  // });

  closeSocket() {
    this.afbService.Disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }

}
