import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, from, Observable } from 'rxjs';
import { AFBWebSocketService } from '../../../@core/services/AFB-websocket.service';
import { VerbsService } from '../../../@core/services/verbs.service';


@Component({
  selector: 'hello-world',
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
  connected$: Observable<Boolean>;
  // urlws = "ws://" + window.location.host + "/api";
  // urlws = "ws://localhost:8000/api?x-afbService-token=mysecret"


  constructor(private verbsService: VerbsService,
    private afbService: AFBWebSocketService) {
    this.verbs = verbsService.verbs;
    afbService.init('api', 'HELLO');
  }

  ngOnInit(): void {
    this.afbService.setURL('localhost', 1234);
    this.afbService.connect();
    this.connected$ = this.afbService.wsConnected$;

  }

  callBinder(api, verb, query) {
    this.status = this.afbService.Send(api + "/" + verb, query).subscribe(d => {
      console.log('data ', d);
    });
  }

  // command (api, verb, query) {
  //   console.log('yo adela1');
  //   console.log('subscribe api=' + api + ' verb=' + verb + ' query=', query);
  //   const question = this.afbService.urlwspub + '/' + api + '/' + verb + '?query=' + JSON.stringify(query);
  //   this._write('question', this.count + ': ' + this.syntaxHighlight(question));
  // }

  // event (obj) {
  //   console.log('gotevent:' + JSON.stringify(obj));
  //   this._write('outevt', (this.evtidx++) + ': ' + JSON.stringify(obj));
  // }

  // reply (obj) {
  //   console.log('replyok:' + JSON.stringify(obj));
  //   this._write('output', this.count + ': OK: ' + this.syntaxHighlight(obj));
  // }

  // error (obj) {
  //   console.log('replyerr:' + JSON.stringify(obj));
  //   this._write('output', this.count + ': ERROR: ' + this.syntaxHighlight(obj));
  // }


  // _write(element, msg) {
  //   const el = document.getElementById(element);
  //   el.innerHTML += msg += '\n\n';
  //   setTimeout(function () {
  //     el.scrollTop = el.scrollHeight;
  //   }, 100);
  // }

  // syntaxHighlight(json) {
  //   console.log('yo adela2');
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
    this.afbService.disconnect();
    this.status = 'closed';
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }

}
