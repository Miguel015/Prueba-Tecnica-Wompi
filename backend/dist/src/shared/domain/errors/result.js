"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = exports.Err = exports.Ok = void 0;
class Ok {
    value;
    isOk = true;
    isErr = false;
    constructor(value) {
        this.value = value;
    }
}
exports.Ok = Ok;
class Err {
    error;
    isOk = false;
    isErr = true;
    constructor(error) {
        this.error = error;
    }
}
exports.Err = Err;
exports.Result = {
    ok(value) {
        return new Ok(value);
    },
    err(error) {
        return new Err(error);
    },
};
//# sourceMappingURL=result.js.map