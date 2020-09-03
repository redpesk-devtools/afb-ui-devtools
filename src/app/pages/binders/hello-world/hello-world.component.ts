import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AFBWebSocket } from '../../../AFB-websock';


@Component({
  selector: 'hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss']
})
export class HelloWorldComponent implements OnInit, OnDestroy {

  dataFromServer: string;
  wsSubscription: Subscription;
  status;
  //urlws = "ws://" + window.location.host + "/api";
  //urlws = "ws://localhost:8000/api?x-afb-token=mysecret"

  private afb: AFBWebSocket;

  constructor() {
    this.afb = new AFBWebSocket("api", "HELLO");

  }

  ngOnInit(): void {
    this.afb.setURL("localhost", 1234);
    this.afb.connect();
  }

  callBinder(api, verb, query) {
    //const requestJ = "ws://localhost:1234/api/" + api + "/" + verb ;//+ JSON.stringify(query);
    this.status = this.afb.Send(api + "/" + verb, query).subscribe(d => {
      console.log('data ', d);
    });
  }

  closeSocket() {
    this.afb.disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }

}