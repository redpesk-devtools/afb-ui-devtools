import { Injectable } from '@angular/core';

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
}
