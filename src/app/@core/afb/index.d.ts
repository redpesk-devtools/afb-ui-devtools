
export interface AFBContext {
    token: string;
    uuid: string | undefined;
}

export class AFB {
    constructor(base: any, initialtoken?: string);

    setURL(location: string, port?: string);
}
