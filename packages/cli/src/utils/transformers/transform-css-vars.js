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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCssVars = void 0;
exports.splitClassName = splitClassName;
exports.applyColorMapping = applyColorMapping;
var ts_morph_1 = require("ts-morph");
var transformCssVars = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var _c;
    var baseColor = _b.baseColor, config = _b.config, sourceFile = _b.sourceFile;
    return __generator(this, function (_d) {
        // No transform if using css variables.
        if (((_c = config.tailwind) === null || _c === void 0 ? void 0 : _c.cssVariables) || !(baseColor === null || baseColor === void 0 ? void 0 : baseColor.inlineColors)) {
            return [2 /*return*/, sourceFile];
        }
        // Find jsx attributes with the name className.
        // const openingElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)
        // const jsxAttributes = sourceFile
        //   .getDescendantsOfKind(SyntaxKind.JsxAttribute)
        //   .filter((node) => node.getName() === "className")
        // for (const jsxAttribute of jsxAttributes) {
        //   const value = jsxAttribute.getInitializer()?.getText()
        //   if (value) {
        //     const valueWithColorMapping = applyColorMapping(
        //       value.replace(/"/g, ""),
        //       baseColor.inlineColors
        //     )
        //     jsxAttribute.setInitializer(`"${valueWithColorMapping}"`)
        //   }
        // }
        sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.StringLiteral).forEach(function (node) {
            var value = node.getText();
            if (value) {
                var valueWithColorMapping = applyColorMapping(value.replace(/'/g, '').replace(/"/g, ''), baseColor.inlineColors);
                // node.replaceWithText(`"${valueWithColorMapping.trim()}"`);
                node.replaceWithText("'".concat(valueWithColorMapping.trim(), "'"));
            }
        });
        return [2 /*return*/, sourceFile];
    });
}); };
exports.transformCssVars = transformCssVars;
// export default function transformer(file: FileInfo, api: API) {
//   const j = api.jscodeshift.withParser("tsx")
//   // Replace bg-background with "bg-white dark:bg-slate-950"
//   const $j = j(file.source)
//   return $j
//     .find(j.JSXAttribute, {
//       name: {
//         name: "className",
//       },
//     })
//     .forEach((path) => {
//       const { node } = path
//       if (node?.value?.type) {
//         if (node.value.type === "StringLiteral") {
//           node.value.value = applyColorMapping(node.value.value)
//         }
//         if (
//           node.value.type === "JSXExpressionContainer" &&
//           node.value.expression.type === "CallExpression"
//         ) {
//           const callee = node.value.expression.callee
//           if (callee.type === "Identifier" && callee.name === "cn") {
//             node.value.expression.arguments.forEach((arg) => {
//               if (arg.type === "StringLiteral") {
//                 arg.value = applyColorMapping(arg.value)
//               }
//               if (
//                 arg.type === "LogicalExpression" &&
//                 arg.right.type === "StringLiteral"
//               ) {
//                 arg.right.value = applyColorMapping(arg.right.value)
//               }
//             })
//           }
//         }
//       }
//     })
//     .toSource()
// }
// // export function splitClassName(input: string): (string | null)[] {
// //   const parts = input.split(":")
// //   const classNames = parts.map((part) => {
// //     const match = part.match(/^\[?(.+)\]$/)
// //     if (match) {
// //       return match[1]
// //     } else {
// //       return null
// //     }
// //   })
// //   return classNames
// // }
// Splits a className into variant-name-alpha.
// eg. hover:bg-primary-100 -> [hover, bg-primary, 100]
function splitClassName(className) {
    if (!className.includes('/') && !className.includes(':')) {
        return [null, className, null];
    }
    var parts = [];
    // First we split to find the alpha.
    var _a = className.split('/'), rest = _a[0], alpha = _a[1];
    // Check if rest has a colon.
    if (!rest.includes(':')) {
        return [null, rest, alpha];
    }
    // Next we split the rest by the colon.
    var split = rest.split(':');
    // We take the last item from the split as the name.
    var name = split.pop();
    // We glue back the rest of the split.
    var variant = split.join(':');
    // Finally we push the variant, name and alpha.
    parts.push(variant !== null && variant !== void 0 ? variant : null, name !== null && name !== void 0 ? name : null, alpha !== null && alpha !== void 0 ? alpha : null);
    return parts;
}
var PREFIXES = ['bg-', 'text-', 'border-', 'ring-offset-', 'ring-'];
function applyColorMapping(input, mapping) {
    // Handle border classes.
    if (input.includes(' border ')) {
        input = input.replace(' border ', ' border border-border ');
    }
    // Build color mappings.
    var classNames = input.split(' ');
    var lightMode = new Set();
    var darkMode = new Set();
    var _loop_1 = function (className) {
        var _a = splitClassName(className), variant = _a[0], value = _a[1], modifier = _a[2];
        var prefix = PREFIXES.find(function (prefix) { return value === null || value === void 0 ? void 0 : value.startsWith(prefix); });
        if (!prefix) {
            if (!lightMode.has(className)) {
                lightMode.add(className);
            }
            return "continue";
        }
        var needle = value === null || value === void 0 ? void 0 : value.replace(prefix, '');
        if (needle && needle in mapping.light) {
            lightMode.add([variant, "".concat(prefix).concat(mapping.light[needle])]
                .filter(Boolean)
                .join(':') + (modifier ? "/".concat(modifier) : ''));
            darkMode.add(['dark', variant, "".concat(prefix).concat(mapping.dark[needle])]
                .filter(Boolean)
                .join(':') + (modifier ? "/".concat(modifier) : ''));
            return "continue";
        }
        if (!lightMode.has(className)) {
            lightMode.add(className);
        }
    };
    for (var _i = 0, classNames_1 = classNames; _i < classNames_1.length; _i++) {
        var className = classNames_1[_i];
        _loop_1(className);
    }
    return __spreadArray(__spreadArray([], Array.from(lightMode), true), Array.from(darkMode), true).join(' ').trim();
}
