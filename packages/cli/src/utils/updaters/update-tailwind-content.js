"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTailwindContent = updateTailwindContent;
exports.transformTailwindContent = transformTailwindContent;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var highlighter_1 = require("@/src/utils/highlighter");
var spinner_1 = require("@/src/utils/spinner");
var update_tailwind_config_1 = require("@/src/utils/updaters/update-tailwind-config");
var ts_morph_1 = require("ts-morph");
function updateTailwindContent(content, config, options) {
    return __awaiter(this, void 0, void 0, function () {
        var tailwindFileRelativePath, tailwindSpinner, raw, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!content) {
                        return [2 /*return*/];
                    }
                    options = __assign({ silent: false }, options);
                    tailwindFileRelativePath = path_1.default.relative(config.resolvedPaths.cwd, config.resolvedPaths.tailwindConfig);
                    tailwindSpinner = (0, spinner_1.spinner)("Updating ".concat(highlighter_1.highlighter.info(tailwindFileRelativePath)), {
                        silent: options.silent,
                    }).start();
                    return [4 /*yield*/, fs_1.promises.readFile(config.resolvedPaths.tailwindConfig, "utf8")];
                case 1:
                    raw = _a.sent();
                    return [4 /*yield*/, transformTailwindContent(raw, content, config)];
                case 2:
                    output = _a.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(config.resolvedPaths.tailwindConfig, output, "utf8")];
                case 3:
                    _a.sent();
                    tailwindSpinner === null || tailwindSpinner === void 0 ? void 0 : tailwindSpinner.succeed();
                    return [2 /*return*/];
            }
        });
    });
}
function transformTailwindContent(input, content, config) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceFile, configObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, update_tailwind_config_1._createSourceFile)(input, config)
                    // Find the object with content property.
                    // This is faster than traversing the default export.
                    // TODO: maybe we do need to traverse the default export?
                ];
                case 1:
                    sourceFile = _a.sent();
                    configObject = sourceFile
                        .getDescendantsOfKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)
                        .find(function (node) {
                        return node
                            .getProperties()
                            .some(function (property) {
                            return property.isKind(ts_morph_1.SyntaxKind.PropertyAssignment) &&
                                property.getName() === "content";
                        });
                    });
                    // We couldn't find the config object, so we return the input as is.
                    if (!configObject) {
                        return [2 /*return*/, input];
                    }
                    addTailwindConfigContent(configObject, content);
                    return [2 /*return*/, sourceFile.getFullText()];
            }
        });
    });
}
function addTailwindConfigContent(configObject, content) {
    return __awaiter(this, void 0, void 0, function () {
        var quoteChar, existingProperty, newProperty, initializer, _i, content_1, contentItem, newValue;
        return __generator(this, function (_a) {
            quoteChar = (0, update_tailwind_config_1._getQuoteChar)(configObject);
            existingProperty = configObject.getProperty("content");
            if (!existingProperty) {
                newProperty = {
                    name: "content",
                    initializer: "[".concat(quoteChar).concat(content.join("".concat(quoteChar, ", ").concat(quoteChar))).concat(quoteChar, "]"),
                };
                configObject.addPropertyAssignment(newProperty);
                return [2 /*return*/, configObject];
            }
            if (existingProperty.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
                initializer = existingProperty.getInitializer();
                // If property is an array, append.
                if (initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.ArrayLiteralExpression)) {
                    for (_i = 0, content_1 = content; _i < content_1.length; _i++) {
                        contentItem = content_1[_i];
                        newValue = "".concat(quoteChar).concat(contentItem).concat(quoteChar);
                        // Check if the array already contains the value.
                        if (initializer
                            .getElements()
                            .map(function (element) { return element.getText(); })
                            .includes(newValue)) {
                            continue;
                        }
                        initializer.addElement(newValue);
                    }
                }
                return [2 /*return*/, configObject];
            }
            return [2 /*return*/, configObject];
        });
    });
}
