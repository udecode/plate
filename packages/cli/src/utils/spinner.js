"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinner = spinner;
var ora_1 = __importDefault(require("ora"));
function spinner(text, options) {
    return (0, ora_1.default)({
        text: text,
        isSilent: options === null || options === void 0 ? void 0 : options.silent,
    });
}
