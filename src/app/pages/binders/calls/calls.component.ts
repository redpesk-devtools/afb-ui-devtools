import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'rp-calls',
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.scss'],
})
export class CallsComponent implements OnInit {

  callDescription: string;
  @Input()
  verb: any;

  dataFromServer: string;
  wsSubscription: Subscription;
  status;
  el;
  verbs;
  evtidx = 0;
  count = 0;
  // urlws = "ws://" + window.location.host + "/api";
  // urlws = "ws://localhost:8000/api?x-afb-token=mysecret"


  constructor(/*   private verbsService: VerbsService,
     private afbService: AFBWebSocketService*/) {
    //   this.verbs = verbsService.verbs;
    //   afbService.init('api', 'HELLO');
  }

  ngOnInit(): void {
    // this.afbService.setURL('localhost', 1234);
    // this.afbService.connect();
  }


  // syntaxHighlight(json) {
  //   if (typeof json !== 'string') {
  //     json = JSON.stringify(json, undefined, 2);
  //   }
  //   json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  //   return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
  //     function (match) {
  //     let cls = 'number';
  //     if (/^"/.test(match)) {
  //       if (/:$/.test(match)) {
  //         cls = 'key';
  //       } else {
  //         cls = 'string';
  //       }
  //     } else if (/true|false/.test(match)) {
  //       cls = 'boolean';
  //     } else if (/null/.test(match)) {
  //       cls = 'null';
  //     }
  //     return '<span class="' + cls + '">' + match + '</span>';
  //   });
  //   }

  closeSocket() {
    // this.afbService.disconnect();
    // this.status = 'closed';
  }

}
