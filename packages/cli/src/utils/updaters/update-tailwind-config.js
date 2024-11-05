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
exports.updateTailwindConfig = updateTailwindConfig;
exports.transformTailwindConfig = transformTailwindConfig;
exports._createSourceFile = _createSourceFile;
exports._getQuoteChar = _getQuoteChar;
exports.nestSpreadProperties = nestSpreadProperties;
exports.unnestSpreadProperties = unnestSpreadProperties;
exports.buildTailwindThemeColorsFromCssVars = buildTailwindThemeColorsFromCssVars;
var deepmerge_1 = __importDefault(require("deepmerge"));
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = __importDefault(require("path"));
var stringify_object_1 = __importDefault(require("stringify-object"));
var ts_morph_1 = require("ts-morph");
var highlighter_1 = require("@/src/utils/highlighter");
var spinner_1 = require("@/src/utils/spinner");
function updateTailwindConfig(tailwindConfig, config, options) {
    return __awaiter(this, void 0, void 0, function () {
        var tailwindFileRelativePath, tailwindSpinner, raw, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!tailwindConfig) {
                        return [2 /*return*/];
                    }
                    options = __assign({ silent: false }, options);
                    tailwindFileRelativePath = path_1.default.relative(config.resolvedPaths.cwd, config.resolvedPaths.tailwindConfig);
                    tailwindSpinner = (0, spinner_1.spinner)("Updating ".concat(highlighter_1.highlighter.info(tailwindFileRelativePath)), {
                        silent: options.silent,
                    }).start();
                    return [4 /*yield*/, fs_1.promises.readFile(config.resolvedPaths.tailwindConfig, 'utf8')];
                case 1:
                    raw = _a.sent();
                    return [4 /*yield*/, transformTailwindConfig(raw, tailwindConfig, config)];
                case 2:
                    output = _a.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(config.resolvedPaths.tailwindConfig, output, 'utf8')];
                case 3:
                    _a.sent();
                    tailwindSpinner === null || tailwindSpinner === void 0 ? void 0 : tailwindSpinner.succeed();
                    return [2 /*return*/];
            }
        });
    });
}
function transformTailwindConfig(input, tailwindConfig, config) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceFile, configObject, quoteChar;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _createSourceFile(input, config)];
                case 1:
                    sourceFile = _b.sent();
                    configObject = sourceFile
                        .getDescendantsOfKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)
                        .find(function (node) {
                        return node
                            .getProperties()
                            .some(function (property) {
                            return property.isKind(ts_morph_1.SyntaxKind.PropertyAssignment) &&
                                property.getName() === 'content';
                        });
                    });
                    // We couldn't find the config object, so we return the input as is.
                    if (!configObject) {
                        return [2 /*return*/, input];
                    }
                    quoteChar = _getQuoteChar(configObject);
                    // Add darkMode.
                    addTailwindConfigProperty(configObject, {
                        name: 'darkMode',
                        value: 'class',
                    }, { quoteChar: quoteChar });
                    // Add Tailwind config plugins.
                    (_a = tailwindConfig.plugins) === null || _a === void 0 ? void 0 : _a.forEach(function (plugin) {
                        addTailwindConfigPlugin(configObject, plugin);
                    });
                    if (!tailwindConfig.theme) return [3 /*break*/, 3];
                    return [4 /*yield*/, addTailwindConfigTheme(configObject, tailwindConfig.theme)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/, sourceFile.getFullText()];
            }
        });
    });
}
function addTailwindConfigProperty(configObject, property, _a) {
    var quoteChar = _a.quoteChar;
    var existingProperty = configObject.getProperty('darkMode');
    if (!existingProperty) {
        var newProperty = {
            initializer: "[".concat(quoteChar).concat(property.value).concat(quoteChar, "]"),
            name: property.name,
        };
        // We need to add darkMode as the first property.
        if (property.name === 'darkMode') {
            configObject.insertPropertyAssignment(0, newProperty);
            return configObject;
        }
        configObject.addPropertyAssignment(newProperty);
        return configObject;
    }
    if (existingProperty.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
        var initializer = existingProperty.getInitializer();
        var newValue = "".concat(quoteChar).concat(property.value).concat(quoteChar);
        // If property is a string, change it to an array and append.
        if (initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.StringLiteral)) {
            var initializerText = initializer.getText();
            initializer.replaceWithText("[".concat(initializerText, ", ").concat(newValue, "]"));
            return configObject;
        }
        // If property is an array, append.
        if (initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.ArrayLiteralExpression)) {
            // Check if the array already contains the value.
            if (initializer
                .getElements()
                .map(function (element) { return element.getText(); })
                .includes(newValue)) {
                return configObject;
            }
            initializer.addElement(newValue);
        }
        return configObject;
    }
    return configObject;
}
function addTailwindConfigTheme(configObject, theme) {
    return __awaiter(this, void 0, void 0, function () {
        var themeProperty, themeInitializer, themeObjectString, themeObject, result, resultString;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Ensure there is a theme property.
                    if (!configObject.getProperty('theme')) {
                        configObject.addPropertyAssignment({
                            initializer: '{}',
                            name: 'theme',
                        });
                    }
                    // Nest all spread properties.
                    nestSpreadProperties(configObject);
                    themeProperty = (_a = configObject
                        .getPropertyOrThrow('theme')) === null || _a === void 0 ? void 0 : _a.asKindOrThrow(ts_morph_1.SyntaxKind.PropertyAssignment);
                    themeInitializer = themeProperty.getInitializer();
                    if (!(themeInitializer === null || themeInitializer === void 0 ? void 0 : themeInitializer.isKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression))) return [3 /*break*/, 2];
                    themeObjectString = themeInitializer.getText();
                    return [4 /*yield*/, parseObjectLiteral(themeObjectString)];
                case 1:
                    themeObject = _b.sent();
                    result = (0, deepmerge_1.default)(themeObject, theme);
                    resultString = (0, stringify_object_1.default)(result)
                        .replace(/'"/g, "'") // Replace `\" with "
                        .replace(/"'/g, "'") // Replace `\" with "
                        .replace(/'\[/g, '[') // Replace `[ with [
                        .replace(/]'/g, ']') // Replace `] with ]
                        .replace(/'\\'/g, "'") // Replace `\' with '
                        .replace(/\\'/g, "'") // Replace \' with '
                        .replace(/\\''/g, "'")
                        .replace(/''/g, "'");
                    themeInitializer.replaceWithText(resultString);
                    _b.label = 2;
                case 2:
                    // Unnest all spread properties.
                    unnestSpreadProperties(configObject);
                    return [2 /*return*/];
            }
        });
    });
}
function addTailwindConfigPlugin(configObject, plugin) {
    var existingPlugins = configObject.getProperty('plugins');
    if (!existingPlugins) {
        configObject.addPropertyAssignment({
            initializer: "[".concat(plugin, "]"),
            name: 'plugins',
        });
        return configObject;
    }
    if (existingPlugins.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
        var initializer = existingPlugins.getInitializer();
        if (initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.ArrayLiteralExpression)) {
            if (initializer
                .getElements()
                .map(function (element) {
                return element.getText().replace(/["']/g, '');
            })
                .includes(plugin.replace(/["']/g, ''))) {
                return configObject;
            }
            initializer.addElement(plugin);
        }
        return configObject;
    }
    return configObject;
}
function _createSourceFile(input, config) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, resolvedPath, tempFile, project, sourceFile;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fs_1.promises.mkdtemp(path_1.default.join((0, os_1.tmpdir)(), 'shadcn-'))];
                case 1:
                    dir = _b.sent();
                    resolvedPath = ((_a = config === null || config === void 0 ? void 0 : config.resolvedPaths) === null || _a === void 0 ? void 0 : _a.tailwindConfig) || 'tailwind.config.ts';
                    tempFile = path_1.default.join(dir, "shadcn-".concat(path_1.default.basename(resolvedPath)));
                    project = new ts_morph_1.Project({
                        compilerOptions: {},
                    });
                    sourceFile = project.createSourceFile(tempFile, input, {
                        // Note: .js and .mjs can still be valid for TS projects.
                        // We can't infer TypeScript from config.tsx.
                        scriptKind: path_1.default.extname(resolvedPath) === '.ts' ? ts_morph_1.ScriptKind.TS : ts_morph_1.ScriptKind.JS,
                    });
                    return [2 /*return*/, sourceFile];
            }
        });
    });
}
function _getQuoteChar(configObject) {
    var _a;
    return ((_a = configObject
        .getFirstDescendantByKind(ts_morph_1.SyntaxKind.StringLiteral)) === null || _a === void 0 ? void 0 : _a.getQuoteKind()) === ts_morph_1.QuoteKind.Single
        ? "'"
        : '"';
}
function nestSpreadProperties(obj) {
    var properties = obj.getProperties();
    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        if (prop.isKind(ts_morph_1.SyntaxKind.SpreadAssignment)) {
            var spreadAssignment = prop.asKindOrThrow(ts_morph_1.SyntaxKind.SpreadAssignment);
            var spreadText = spreadAssignment.getExpression().getText();
            // Replace spread with a property assignment
            obj.insertPropertyAssignment(i, {
                initializer: "\"...".concat(spreadText.replace(/^\.{3}/, ''), "\""),
                name: "___".concat(spreadText.replace(/^\.{3}/, '')),
            });
            // Remove the original spread assignment
            spreadAssignment.remove();
        }
        else if (prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
            var propAssignment = prop.asKindOrThrow(ts_morph_1.SyntaxKind.PropertyAssignment);
            var initializer = propAssignment.getInitializer();
            if (initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)) {
                // Recursively process nested object literals
                nestSpreadProperties(initializer.asKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression));
            }
        }
    }
}
function unnestSpreadProperties(obj) {
    var properties = obj.getProperties();
    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        if (prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
            var propAssignment = prop;
            var initializer = propAssignment.getInitializer();
            if (initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.StringLiteral)) {
                var value = initializer.getLiteralValue();
                if (value.startsWith('...')) {
                    obj.insertSpreadAssignment(i, { expression: value.slice(3) });
                    propAssignment.remove();
                }
            }
            else if (initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)) {
                unnestSpreadProperties(initializer);
            }
        }
    }
}
function parseObjectLiteral(objectLiteralString) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceFile, statement, declaration, initializer;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _createSourceFile("const theme = ".concat(objectLiteralString), null)];
                case 1:
                    sourceFile = _b.sent();
                    statement = sourceFile.getStatements()[0];
                    if (!((statement === null || statement === void 0 ? void 0 : statement.getKind()) === ts_morph_1.SyntaxKind.VariableStatement)) return [3 /*break*/, 3];
                    declaration = (_a = statement
                        .getDeclarationList()) === null || _a === void 0 ? void 0 : _a.getDeclarations()[0];
                    initializer = declaration.getInitializer();
                    if (!(initializer === null || initializer === void 0 ? void 0 : initializer.isKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression))) return [3 /*break*/, 3];
                    return [4 /*yield*/, parseObjectLiteralExpression(initializer)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: throw new Error('Invalid input: not an object literal');
            }
        });
    });
}
function parseObjectLiteralExpression(node) {
    var _a;
    var result = {};
    for (var _i = 0, _b = node.getProperties(); _i < _b.length; _i++) {
        var property = _b[_i];
        if (property.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
            var name_1 = property.getName().replace(/'/g, '');
            result[name_1] = ((_a = property
                .getInitializer()) === null || _a === void 0 ? void 0 : _a.isKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression))
                ? parseObjectLiteralExpression(property.getInitializer())
                : parseValue(property.getInitializer());
        }
    }
    return result;
}
function parseValue(node) {
    switch (node.kind) {
        case ts_morph_1.SyntaxKind.ArrayLiteralExpression: {
            return node.elements.map(parseValue);
        }
        case ts_morph_1.SyntaxKind.FalseKeyword: {
            return false;
        }
        case ts_morph_1.SyntaxKind.NullKeyword: {
            return null;
        }
        case ts_morph_1.SyntaxKind.NumericLiteral: {
            return Number(node.text);
        }
        case ts_morph_1.SyntaxKind.StringLiteral: {
            return node.text;
        }
        case ts_morph_1.SyntaxKind.TrueKeyword: {
            return true;
        }
        default: {
            return node.getText();
        }
    }
}
function buildTailwindThemeColorsFromCssVars(cssVars) {
    var result = {};
    for (var _i = 0, _a = Object.keys(cssVars); _i < _a.length; _i++) {
        var key = _a[_i];
        var parts = key.split('-');
        var colorName = parts[0];
        var subType = parts.slice(1).join('-');
        if (subType === '') {
            if (typeof result[colorName] === 'object') {
                result[colorName].DEFAULT = "hsl(var(--".concat(key, "))");
            }
            else {
                result[colorName] = "hsl(var(--".concat(key, "))");
            }
        }
        else {
            if (typeof result[colorName] !== 'object') {
                result[colorName] = { DEFAULT: "hsl(var(--".concat(colorName, "))") };
            }
            result[colorName][subType] = "hsl(var(--".concat(key, "))");
        }
    }
    // Remove DEFAULT if it's not in the original cssVars
    for (var _b = 0, _c = Object.entries(result); _b < _c.length; _b++) {
        var _d = _c[_b], colorName = _d[0], value = _d[1];
        if (typeof value === 'object' &&
            value.DEFAULT === "hsl(var(--".concat(colorName, "))") &&
            !(colorName in cssVars)) {
            delete value.DEFAULT;
        }
    }
    return result;
}
