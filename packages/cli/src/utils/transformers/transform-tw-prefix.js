"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformTwPrefixes = void 0;
exports.applyPrefix = applyPrefix;
exports.applyPrefixesCss = applyPrefixesCss;
var ts_morph_1 = require("ts-morph");
var transform_css_vars_1 = require("./transform-css-vars");
var transformTwPrefixes = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var _c;
    var config = _b.config, sourceFile = _b.sourceFile;
    return __generator(this, function (_d) {
        if (!((_c = config.tailwind) === null || _c === void 0 ? void 0 : _c.prefix)) {
            return [2 /*return*/, sourceFile];
        }
        // Find the cva function calls.
        sourceFile
            .getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression)
            .filter(function (node) { return node.getExpression().getText() === 'cva'; })
            .forEach(function (node) {
            var _a, _b, _c, _d, _e;
            // cva(base, ...)
            if ((_a = node.getArguments()[0]) === null || _a === void 0 ? void 0 : _a.isKind(ts_morph_1.SyntaxKind.StringLiteral)) {
                var defaultClassNames = node.getArguments()[0];
                if (defaultClassNames) {
                    defaultClassNames.replaceWithText("'".concat(applyPrefix((_b = defaultClassNames.getText()) === null || _b === void 0 ? void 0 : _b.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                }
            }
            // cva(..., { variants: { ... } })
            if ((_c = node.getArguments()[1]) === null || _c === void 0 ? void 0 : _c.isKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)) {
                (_e = (_d = node
                    .getArguments()[1]) === null || _d === void 0 ? void 0 : _d.getDescendantsOfKind(ts_morph_1.SyntaxKind.PropertyAssignment).find(function (node) { return node.getName() === 'variants'; })) === null || _e === void 0 ? void 0 : _e.getDescendantsOfKind(ts_morph_1.SyntaxKind.PropertyAssignment).forEach(function (node) {
                    node
                        .getDescendantsOfKind(ts_morph_1.SyntaxKind.PropertyAssignment)
                        .forEach(function (node) {
                        var _a;
                        var classNames = node.getInitializerIfKind(ts_morph_1.SyntaxKind.StringLiteral);
                        if (classNames) {
                            classNames === null || classNames === void 0 ? void 0 : classNames.replaceWithText("'".concat(applyPrefix((_a = classNames.getText()) === null || _a === void 0 ? void 0 : _a.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                        }
                    });
                });
            }
        });
        // Find all jsx attributes with the name className.
        sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.JsxAttribute).forEach(function (node) {
            var _a, _b, _c, _d, _e;
            if (node.getName() === 'className') {
                // className="..."
                if ((_a = node.getInitializer()) === null || _a === void 0 ? void 0 : _a.isKind(ts_morph_1.SyntaxKind.StringLiteral)) {
                    var value = node.getInitializer();
                    if (value) {
                        value.replaceWithText("'".concat(applyPrefix((_b = value.getText()) === null || _b === void 0 ? void 0 : _b.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                    }
                }
                // className={...}
                if ((_c = node.getInitializer()) === null || _c === void 0 ? void 0 : _c.isKind(ts_morph_1.SyntaxKind.JsxExpression)) {
                    // Check if it's a call to cn().
                    var callExpression = (_d = node
                        .getInitializer()) === null || _d === void 0 ? void 0 : _d.getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression).find(function (node) { return node.getExpression().getText() === 'cn'; });
                    if (callExpression) {
                        // Loop through the arguments.
                        callExpression.getArguments().forEach(function (node) {
                            var _a;
                            if (node.isKind(ts_morph_1.SyntaxKind.ConditionalExpression) ||
                                node.isKind(ts_morph_1.SyntaxKind.BinaryExpression)) {
                                node
                                    .getChildrenOfKind(ts_morph_1.SyntaxKind.StringLiteral)
                                    .forEach(function (node) {
                                    var _a;
                                    node.replaceWithText("'".concat(applyPrefix((_a = node.getText()) === null || _a === void 0 ? void 0 : _a.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                                });
                            }
                            if (node.isKind(ts_morph_1.SyntaxKind.StringLiteral)) {
                                node.replaceWithText("'".concat(applyPrefix((_a = node.getText()) === null || _a === void 0 ? void 0 : _a.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                            }
                        });
                    }
                }
            }
            // classNames={...}
            if (node.getName() === 'classNames' &&
                ((_e = node.getInitializer()) === null || _e === void 0 ? void 0 : _e.isKind(ts_morph_1.SyntaxKind.JsxExpression))) {
                node
                    .getDescendantsOfKind(ts_morph_1.SyntaxKind.PropertyAssignment)
                    .forEach(function (node) {
                    var _a, _b, _c;
                    if ((_a = node.getInitializer()) === null || _a === void 0 ? void 0 : _a.isKind(ts_morph_1.SyntaxKind.CallExpression)) {
                        var callExpression = node.getInitializerIfKind(ts_morph_1.SyntaxKind.CallExpression);
                        if (callExpression) {
                            // Loop through the arguments.
                            callExpression.getArguments().forEach(function (arg) {
                                var _a;
                                if (arg.isKind(ts_morph_1.SyntaxKind.ConditionalExpression)) {
                                    arg
                                        .getChildrenOfKind(ts_morph_1.SyntaxKind.StringLiteral)
                                        .forEach(function (node) {
                                        var _a;
                                        node.replaceWithText("'".concat(applyPrefix((_a = node.getText()) === null || _a === void 0 ? void 0 : _a.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                                    });
                                }
                                if (arg.isKind(ts_morph_1.SyntaxKind.StringLiteral)) {
                                    arg.replaceWithText("'".concat(applyPrefix((_a = arg.getText()) === null || _a === void 0 ? void 0 : _a.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                                }
                            });
                        }
                    }
                    if (((_b = node.getInitializer()) === null || _b === void 0 ? void 0 : _b.isKind(ts_morph_1.SyntaxKind.StringLiteral)) &&
                        node.getName() !== 'variant') {
                        var classNames = node.getInitializer();
                        if (classNames) {
                            classNames.replaceWithText("'".concat(applyPrefix((_c = classNames.getText()) === null || _c === void 0 ? void 0 : _c.replace(/"|'/g, ''), config.tailwind.prefix), "'"));
                        }
                    }
                });
            }
        });
        return [2 /*return*/, sourceFile];
    });
}); };
exports.transformTwPrefixes = transformTwPrefixes;
function applyPrefix(input, prefix) {
    if (prefix === void 0) { prefix = ''; }
    var classNames = input.split(' ');
    var prefixed = [];
    for (var _i = 0, classNames_1 = classNames; _i < classNames_1.length; _i++) {
        var className = classNames_1[_i];
        var _a = (0, transform_css_vars_1.splitClassName)(className), variant = _a[0], value = _a[1], modifier = _a[2];
        if (variant) {
            modifier
                ? prefixed.push("".concat(variant, ":").concat(prefix).concat(value, "/").concat(modifier))
                : prefixed.push("".concat(variant, ":").concat(prefix).concat(value));
        }
        else {
            modifier
                ? prefixed.push("".concat(prefix).concat(value, "/").concat(modifier))
                : prefixed.push("".concat(prefix).concat(value));
        }
    }
    return prefixed.join(' ');
}
function applyPrefixesCss(css, prefix) {
    var lines = css.split('\n');
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.includes('@apply')) {
            var originalTWCls = line.replace('@apply', '').trim();
            var prefixedTwCls = applyPrefix(originalTWCls, prefix);
            css = css.replace(originalTWCls, prefixedTwCls);
        }
    }
    return css;
}
