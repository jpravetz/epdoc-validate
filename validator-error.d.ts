import { Dict } from 'epdoc-util';
export declare class ValidatorError {
    key: string;
    type: string;
    constructor(key: string, type: string, params?: Dict);
    readonly message: string;
}
