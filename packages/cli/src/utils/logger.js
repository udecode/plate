"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var highlighter_1 = require("@/src/utils/highlighter");
exports.logger = {
    break: function () {
        console.log('');
    },
    error: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(highlighter_1.highlighter.error(args.join(' ')));
    },
    info: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(highlighter_1.highlighter.info(args.join(' ')));
    },
    log: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(args.join(' '));
    },
    success: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(highlighter_1.highlighter.success(args.join(' ')));
    },
    warn: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(highlighter_1.highlighter.warn(args.join(' ')));
    },
};
