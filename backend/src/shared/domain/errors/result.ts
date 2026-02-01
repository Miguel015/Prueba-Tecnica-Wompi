export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E = Error> {
  readonly isOk: true = true;
  readonly isErr: false = false;

  constructor(public readonly value: T) {}
}

export class Err<T, E = Error> {
  readonly isOk: false = false;
  readonly isErr: true = true;

  constructor(public readonly error: E) {}
}

export const Result = {
  ok<T, E = Error>(value: T): Result<T, E> {
    return new Ok<T, E>(value);
  },
  err<T, E = Error>(error: E): Result<T, E> {
    return new Err<T, E>(error);
  },
};
