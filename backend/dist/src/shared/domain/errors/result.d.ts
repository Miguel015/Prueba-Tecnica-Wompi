export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;
export declare class Ok<T, E = Error> {
    readonly value: T;
    readonly isOk: true;
    readonly isErr: false;
    constructor(value: T);
}
export declare class Err<T, E = Error> {
    readonly error: E;
    readonly isOk: false;
    readonly isErr: true;
    constructor(error: E);
}
export declare const Result: {
    ok<T, E = Error>(value: T): Result<T, E>;
    err<T, E = Error>(error: E): Result<T, E>;
};
