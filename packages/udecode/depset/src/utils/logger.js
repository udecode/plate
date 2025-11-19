"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.highlighter = void 0;
var colors_1 = require("kleur/colors");
exports.highlighter = {
    error: colors_1.red,
    info: colors_1.cyan,
    success: colors_1.green,
    warn: colors_1.yellow,
};
exports.logger = {
    break: function () {
        console.log('');
    },
    error: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(exports.highlighter.error(args.join(' ')));
    },
    info: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(exports.highlighter.info(args.join(' ')));
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
        console.log(exports.highlighter.success(args.join(' ')));
    },
    warn: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(exports.highlighter.warn(args.join(' ')));
    },
};
