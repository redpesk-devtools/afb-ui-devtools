import { Injectable } from '@angular/core';

export interface Verb {
  api: string;
  verb: string;
  query: string;
  description: string;
}
@Injectable()
export class VerbsService {
    verbs = [
        {
           api: 'helloworld',
           verb : 'ping',
           query: '{args:{ var1:1234 , var2:Test ping}}',
           action: 'Send ping',
        },
        {
            api: 'helloworld',
            verb: 'testargs',
            query: {'cezam': 'open'},
            action: 'Send testargs OK',
        },
        {
            api: 'helloworld',
            verb: 'testargs',
            query: {'foo': 'toto'},
            action: 'Send testargs Error',
        },
        {
            api: 'unknown_api',
            verb: 'ping',
            query: {},
            action: 'Send unknown Api',
        },
        {
            api: 'helloworld',
            verb: 'unknown_verb',
            query: {},
            action: 'Send unknown Verb',
        },
        {
            api: 'helloworld-event',
            verb: 'startTimer',
            query: {},
            action: 'Start timer',
        },
        {
            api: 'helloworld-event',
            verb: 'subscribe',
            query: '',
            action: 'Subscribe event',
        },
        {
            api: 'helloworld-event',
            verb: 'unsubscribe',
            query: '',
            action: 'Unsubscribe event',
        },
    ];
    // getApis() {
    //     let apiVerbs: Array<Object>;
    //     this.status= this.afbService.Send('monitor/get',{'apis':true}).subscribe(d => {
    //       console.log('essai', d);
    //       const keys = Object.keys(d.apis);
    //       const array = keys.map(key => ({ key: key, value: d.apis[key] }));
    //       console.log('apis', keys);
    //       array.forEach(function (value) {
    //         if (value.key !== 'monitor') {
    //           const keys2 = Object.keys(value.value.paths);
    //           const array2 = keys2.map(key => ({ key: key, value: value.value.paths[key] }));
    //           array2.forEach(function (value2) {
    //             let Verb2 = {} as Verb;
    //             Verb2.api = value.key;
    //             Verb2.verb = value2.key;
    //             console.log('final', Verb2);
    //           });
    //           console.log(array2);
    //           console.log(value.key);
    //           }
    //         });
    //     });
    //   }
}
