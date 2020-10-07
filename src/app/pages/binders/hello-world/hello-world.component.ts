import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { AFBWebSocketService, SocketStatus } from '../../../@core/services/AFB-websocket.service';
import { VerbsService } from '../../../@core/services/verbs.service';


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
  verbs;
  evtidx = 0;
  count = 0;

  wsStatus$: Observable<SocketStatus>;
  // urlws = "ws://" + window.location.host + "/api";
  // urlws = "ws://localhost:8000/api?x-afbService-token=mysecret"


  constructor(private verbsService: VerbsService,
    private afbService: AFBWebSocketService) {
    this.verbsService = verbsService;
    this.verbs = this.verbsService.verbs;
    afbService.Init('api', 'HELLO');
  }

  ngOnInit(): void {
    this.afbService.SetURL('localhost', '1234');
    this.afbService.Connect();
    this.wsStatus$ = this.afbService.Status$;

  }

  callBinder(api, verb, query) {
    this.status = this.afbService.Send(api + '/' + verb, query).subscribe(d => {
      // console.log('data ', d);
    });
  }

  closeSocket() {
    this.afbService.Disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }

}
