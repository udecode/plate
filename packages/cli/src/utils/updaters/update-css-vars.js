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
exports.updateCssVars = updateCssVars;
exports.transformCssVars = transformCssVars;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var postcss_1 = __importDefault(require("postcss"));
var at_rule_1 = __importDefault(require("postcss/lib/at-rule"));
var highlighter_1 = require("@/src/utils/highlighter");
var spinner_1 = require("@/src/utils/spinner");
function updateCssVars(cssVars, config, options) {
    return __awaiter(this, void 0, void 0, function () {
        var cssFilepath, cssFilepathRelative, cssVarsSpinner, raw, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!cssVars ||
                        Object.keys(cssVars).length === 0 ||
                        !config.resolvedPaths.tailwindCss) {
                        return [2 /*return*/];
                    }
                    options = __assign({ cleanupDefaultNextStyles: false, silent: false }, options);
                    cssFilepath = config.resolvedPaths.tailwindCss;
                    cssFilepathRelative = path_1.default.relative(config.resolvedPaths.cwd, cssFilepath);
                    cssVarsSpinner = (0, spinner_1.spinner)("Updating ".concat(highlighter_1.highlighter.info(cssFilepathRelative)), {
                        silent: options.silent,
                    }).start();
                    return [4 /*yield*/, fs_1.promises.readFile(cssFilepath, 'utf8')];
                case 1:
                    raw = _a.sent();
                    return [4 /*yield*/, transformCssVars(raw, cssVars, config, {
                            cleanupDefaultNextStyles: options.cleanupDefaultNextStyles,
                            registryName: options.registryName,
                        })];
                case 2:
                    output = _a.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(cssFilepath, output, 'utf8')];
                case 3:
                    _a.sent();
                    cssVarsSpinner.succeed();
                    return [2 /*return*/];
            }
        });
    });
}
function transformCssVars(input, cssVars, config, options) {
    return __awaiter(this, void 0, void 0, function () {
        var plugins, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = __assign({ cleanupDefaultNextStyles: false }, options);
                    plugins = [updateCssVarsPlugin(cssVars, options.registryName)];
                    if (options.cleanupDefaultNextStyles) {
                        plugins.push(cleanupDefaultNextStylesPlugin());
                    }
                    // Only add the base layer plugin if we're using css variables.
                    if (config.tailwind.cssVariables) {
                        plugins.push(updateBaseLayerPlugin(options.registryName));
                    }
                    return [4 /*yield*/, (0, postcss_1.default)(plugins).process(input, {
                            from: undefined,
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.css];
            }
        });
    });
}
function updateBaseLayerPlugin(registryName) {
    return {
        Once: function (root) {
            var requiredRules = [
                { apply: 'border-border', selector: '*' },
                { apply: 'bg-background text-foreground', selector: 'body' },
            ];
            var baseLayer = root.nodes.find(function (node) {
                return node.type === 'atrule' &&
                    node.name === 'layer' &&
                    node.params === 'base' &&
                    requiredRules.every(function (_a) {
                        var _b;
                        var apply = _a.apply, selector = _a.selector;
                        return (_b = node.nodes) === null || _b === void 0 ? void 0 : _b.some(function (rule) {
                            return rule.type === 'rule' &&
                                rule.selector === selector &&
                                rule.nodes.some(function (applyRule) {
                                    return applyRule.type === 'atrule' &&
                                        applyRule.name === 'apply' &&
                                        applyRule.params === apply;
                                });
                        });
                    });
            });
            if (!baseLayer) {
                baseLayer = postcss_1.default.atRule({
                    name: 'layer',
                    params: 'base',
                    raws: { before: '\n', between: ' ', semicolon: true },
                });
                root.append(baseLayer);
            }
            requiredRules.forEach(function (_a) {
                var _b;
                var apply = _a.apply, selector = _a.selector;
                var existingRule = (_b = baseLayer === null || baseLayer === void 0 ? void 0 : baseLayer.nodes) === null || _b === void 0 ? void 0 : _b.find(function (node) {
                    return node.type === 'rule' && node.selector === selector;
                });
                if (!existingRule) {
                    baseLayer === null || baseLayer === void 0 ? void 0 : baseLayer.append(postcss_1.default.rule({
                        nodes: [
                            postcss_1.default.atRule({
                                name: 'apply',
                                params: apply,
                                raws: { before: '\n    ', semicolon: true },
                            }),
                        ],
                        raws: { before: '\n  ', between: ' ', semicolon: true },
                        selector: registryName
                            ? "[data-registry=\"".concat(registryName, "\"] ").concat(selector)
                            : selector,
                    }));
                }
            });
        },
        postcssPlugin: 'update-base-layer',
    };
}
function updateCssVarsPlugin(cssVars, registryName) {
    return {
        Once: function (root) {
            var baseLayer = root.nodes.find(function (node) {
                return node.type === 'atrule' &&
                    node.name === 'layer' &&
                    node.params === 'base';
            });
            if (!(baseLayer instanceof at_rule_1.default)) {
                baseLayer = postcss_1.default.atRule({
                    name: 'layer',
                    nodes: [],
                    params: 'base',
                    raws: {
                        before: '\n',
                        between: ' ',
                        semicolon: true,
                    },
                });
                root.append(baseLayer);
            }
            if (baseLayer !== undefined) {
                // Add variables for each key in cssVars
                Object.entries(cssVars).forEach(function (_a) {
                    var key = _a[0], vars = _a[1];
                    var selector = key === 'light'
                        ? registryName
                            ? "[data-registry=\"".concat(registryName, "\"]")
                            : ':root'
                        : registryName
                            ? "[data-registry=\"".concat(registryName, "\"].dark")
                            : '.dark';
                    addOrUpdateVars(baseLayer, selector, vars);
                });
            }
        },
        postcssPlugin: 'update-css-vars',
    };
}
function removeConflictVars(root) {
    var rootRule = root.nodes.find(function (node) { return node.type === 'rule' && node.selector === ':root'; });
    if (rootRule) {
        var propsToRemove_1 = new Set(['--background', '--foreground']);
        rootRule.nodes
            .filter(function (node) {
            return node.type === 'decl' && propsToRemove_1.has(node.prop);
        })
            .forEach(function (node) { return node.remove(); });
        if (rootRule.nodes.length === 0) {
            rootRule.remove();
        }
    }
}
function cleanupDefaultNextStylesPlugin() {
    return {
        Once: function (root) {
            var _a, _b;
            var bodyRule = root.nodes.find(function (node) { return node.type === 'rule' && node.selector === 'body'; });
            if (bodyRule) {
                // Remove color from the body node.
                (_a = bodyRule.nodes
                    .find(function (node) {
                    return node.type === 'decl' &&
                        node.prop === 'color' &&
                        ['rgb(var(--foreground-rgb))', 'var(--foreground)'].includes(node.value);
                })) === null || _a === void 0 ? void 0 : _a.remove();
                // Remove background: linear-gradient.
                (_b = bodyRule.nodes
                    .find(function (node) {
                    return (node.type === 'decl' &&
                        node.prop === 'background' &&
                        // This is only going to run on create project, so all good.
                        (node.value.startsWith('linear-gradient') ||
                            node.value === 'var(--background)'));
                })) === null || _b === void 0 ? void 0 : _b.remove();
                // If the body rule is empty, remove it.
                if (bodyRule.nodes.length === 0) {
                    bodyRule.remove();
                }
            }
            removeConflictVars(root);
            var darkRootRule = root.nodes.find(function (node) {
                return node.type === 'atrule' &&
                    node.params === '(prefers-color-scheme: dark)';
            });
            if (darkRootRule) {
                removeConflictVars(darkRootRule);
                if (darkRootRule.nodes.length === 0) {
                    darkRootRule.remove();
                }
            }
        },
        postcssPlugin: 'cleanup-default-next-styles',
    };
}
function addOrUpdateVars(baseLayer, selector, vars) {
    var _a;
    var ruleNode = (_a = baseLayer.nodes) === null || _a === void 0 ? void 0 : _a.find(function (node) { return node.type === 'rule' && node.selector === selector; });
    if (!ruleNode && Object.keys(vars).length > 0) {
        ruleNode = postcss_1.default.rule({
            raws: { before: '\n  ', between: ' ' },
            selector: selector,
        });
        baseLayer.append(ruleNode);
    }
    Object.entries(vars).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var prop = "--".concat(key.replace(/^--/, ''));
        var newDecl = postcss_1.default.decl({
            prop: prop,
            raws: { semicolon: true },
            value: value,
        });
        var existingDecl = ruleNode === null || ruleNode === void 0 ? void 0 : ruleNode.nodes.find(function (node) {
            return node.type === 'decl' && node.prop === prop;
        });
        existingDecl
            ? existingDecl.replaceWith(newDecl)
            : ruleNode === null || ruleNode === void 0 ? void 0 : ruleNode.append(newDecl);
    });
}
