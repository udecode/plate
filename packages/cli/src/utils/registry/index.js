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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTRY_MAP = exports.REGISTRY_URL = void 0;
exports.getRegistryIndex = getRegistryIndex;
exports.getRegistryStyles = getRegistryStyles;
exports.getRegistryItem = getRegistryItem;
exports.getRegistryBaseColors = getRegistryBaseColors;
exports.getRegistryBaseColor = getRegistryBaseColor;
exports.resolveTree = resolveTree;
exports.fetchTree = fetchTree;
exports.getItemTargetPath = getItemTargetPath;
exports.fetchRegistry = fetchRegistry;
exports.getRegistryItemFileTargetPath = getRegistryItemFileTargetPath;
exports.registryResolveItemsTree = registryResolveItemsTree;
exports.registryGetTheme = registryGetTheme;
exports.getDefaultConfig = getDefaultConfig;
var deepmerge_1 = __importDefault(require("deepmerge"));
var https_proxy_agent_1 = require("https-proxy-agent");
var node_fetch_1 = __importDefault(require("node-fetch"));
var path_1 = __importDefault(require("path"));
var zod_1 = require("zod");
var handle_error_1 = require("@/src/utils/handle-error");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var schema_1 = require("@/src/utils/registry/schema");
var update_tailwind_config_1 = require("@/src/utils/updaters/update-tailwind-config");
exports.REGISTRY_URL = (_a = process.env.REGISTRY_URL) !== null && _a !== void 0 ? _a : "https://ui.shadcn.com/r";
exports.REGISTRY_MAP = {
    magic: 'https://magicui.design/r',
    plate: 'https://platejs.org/r',
    shadcn: exports.REGISTRY_URL,
};
var agent = process.env.https_proxy
    ? new https_proxy_agent_1.HttpsProxyAgent(process.env.https_proxy)
    : undefined;
function getRegistryIndex(registryUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchRegistry(['index.json'], registryUrl)];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/, schema_1.registryIndexSchema.parse(result)];
                case 2:
                    error_1 = _a.sent();
                    logger_1.logger.error("\n");
                    (0, handle_error_1.handleError)(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getRegistryStyles(registryUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchRegistry(["styles/index.json"], registryUrl)];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/, schema_1.stylesSchema.parse(result)];
                case 2:
                    error_2 = _a.sent();
                    logger_1.logger.error("\n");
                    (0, handle_error_1.handleError)(error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getRegistryItem(name, style, registryUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchRegistry([isUrl(name) ? name : "styles/".concat(style, "/").concat(name, ".json")], registryUrl, true)];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/, schema_1.registryItemSchema.parse(result)];
                case 2:
                    error_3 = _a.sent();
                    logger_1.logger.break();
                    (0, handle_error_1.handleError)(error_3);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getRegistryBaseColors() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, [
                    {
                        label: "Neutral",
                        name: "neutral",
                    },
                    {
                        label: "Gray",
                        name: "gray",
                    },
                    {
                        label: "Zinc",
                        name: "zinc",
                    },
                    {
                        label: "Stone",
                        name: "stone",
                    },
                    {
                        label: "Slate",
                        name: "slate",
                    },
                ]];
        });
    });
}
function getRegistryBaseColor(baseColor) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchRegistry(["colors/".concat(baseColor, ".json")])];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/, schema_1.registryBaseColorSchema.parse(result)];
                case 2:
                    error_4 = _a.sent();
                    (0, handle_error_1.handleError)(error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function resolveTree(index, names) {
    return __awaiter(this, void 0, void 0, function () {
        var tree, _loop_1, _i, names_1, name_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tree = [];
                    _loop_1 = function (name_1) {
                        var entry, dependencies;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    entry = index.find(function (entry) { return entry.name === name_1; });
                                    if (!entry) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    tree.push(entry);
                                    if (!entry.registryDependencies) return [3 /*break*/, 2];
                                    return [4 /*yield*/, resolveTree(index, entry.registryDependencies)];
                                case 1:
                                    dependencies = _b.sent();
                                    tree.push.apply(tree, dependencies);
                                    _b.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, names_1 = names;
                    _a.label = 1;
                case 1:
                    if (!(_i < names_1.length)) return [3 /*break*/, 4];
                    name_1 = names_1[_i];
                    return [5 /*yield**/, _loop_1(name_1)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, tree.filter(function (component, index, self) {
                        return self.findIndex(function (c) { return c.name === component.name; }) === index;
                    })];
            }
        });
    });
}
function fetchTree(style, tree) {
    return __awaiter(this, void 0, void 0, function () {
        var paths, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    paths = tree.map(function (item) { return "styles/".concat(style, "/").concat(item.name, ".json"); });
                    return [4 /*yield*/, fetchRegistry(paths)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, schema_1.registryIndexSchema.parse(result)];
                case 2:
                    error_5 = _a.sent();
                    (0, handle_error_1.handleError)(error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getItemTargetPath(config, item, override) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, parent, type;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            if (override) {
                return [2 /*return*/, override];
            }
            if (item.type === "registry:ui") {
                return [2 /*return*/, (_b = config.resolvedPaths.ui) !== null && _b !== void 0 ? _b : config.resolvedPaths.components];
            }
            _a = (_d = (_c = item.type) === null || _c === void 0 ? void 0 : _c.split(":")) !== null && _d !== void 0 ? _d : [], parent = _a[0], type = _a[1];
            if (!(parent in config.resolvedPaths)) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, path_1.default.join(config.resolvedPaths[parent], type)];
        });
    });
}
function fetchRegistry(paths, registryUrl, ignoreErrors) {
    return __awaiter(this, void 0, void 0, function () {
        var results, error_6;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all(paths.map(function (path) { return __awaiter(_this, void 0, void 0, function () {
                            var url, response, errorMessages, contentType, result, message;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        url = getRegistryUrl(path, registryUrl);
                                        return [4 /*yield*/, (0, node_fetch_1.default)(url, { agent: agent })];
                                    case 1:
                                        response = _a.sent();
                                        if (!!response.ok) return [3 /*break*/, 3];
                                        errorMessages = {
                                            400: "Bad request",
                                            401: "Unauthorized",
                                            403: "Forbidden",
                                            404: "Not found",
                                            500: "Internal server error",
                                        };
                                        if (response.status === 401) {
                                            throw new Error("You are not authorized to access the component at ".concat(highlighter_1.highlighter.info(url), ".\nIf this is a remote registry, you may need to authenticate."));
                                        }
                                        if (response.status === 404) {
                                            throw new Error("The component at ".concat(highlighter_1.highlighter.info(url), " was not found.\nIt may not exist at the registry. Please make sure it is a valid component."));
                                        }
                                        if (response.status === 403) {
                                            throw new Error("You do not have access to the component at ".concat(highlighter_1.highlighter.info(url), ".\nIf this is a remote registry, you may need to authenticate or a token."));
                                        }
                                        contentType = response.headers.get("content-type");
                                        if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes("application/json"))) {
                                            throw new Error("Invalid response from ".concat(highlighter_1.highlighter.info(url), "."));
                                        }
                                        return [4 /*yield*/, response.json()];
                                    case 2:
                                        result = _a.sent();
                                        message = result && typeof result === "object" && "error" in result
                                            ? result.error
                                            : response.statusText || errorMessages[response.status];
                                        throw new Error("Failed to fetch from ".concat(highlighter_1.highlighter.info(url), ".\n").concat(message));
                                    case 3: return [2 /*return*/, response.json()];
                                }
                            });
                        }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results];
                case 2:
                    error_6 = _a.sent();
                    if (!ignoreErrors) {
                        logger_1.logger.error("\n");
                        (0, handle_error_1.handleError)(error_6);
                    }
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getRegistryItemFileTargetPath(file, config, override) {
    if (override) {
        return override;
    }
    if (file.type === "registry:ui") {
        return config.resolvedPaths.ui;
    }
    if (file.type === "registry:lib") {
        return config.resolvedPaths.lib;
    }
    if (file.type === "registry:block" || file.type === "registry:component") {
        return config.resolvedPaths.components;
    }
    if (file.type === "registry:hook") {
        return config.resolvedPaths.hooks;
    }
    // TODO: we put this in components for now.
    // We should move this to pages as per framework.
    if (file.type === "registry:page") {
        return config.resolvedPaths.components;
    }
    return config.resolvedPaths.components;
}
function registryResolveItemsTree(names, config) {
    return __awaiter(this, void 0, void 0, function () {
        var index, registryDependencies, _i, names_2, name_2, itemRegistryDependencies, uniqueRegistryDependencies, result, payload, theme, tailwind_1, cssVars_1, docs_1, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, getRegistryIndex(config.url)];
                case 1:
                    index = _a.sent();
                    if (!index) {
                        return [2 /*return*/, null];
                    }
                    // If we're resolving the index, we want it to go first.
                    if (names.includes("index")) {
                        names.unshift("index");
                    }
                    registryDependencies = [];
                    _i = 0, names_2 = names;
                    _a.label = 2;
                case 2:
                    if (!(_i < names_2.length)) return [3 /*break*/, 5];
                    name_2 = names_2[_i];
                    return [4 /*yield*/, resolveRegistryDependencies(name_2, config)];
                case 3:
                    itemRegistryDependencies = _a.sent();
                    registryDependencies.push.apply(registryDependencies, itemRegistryDependencies);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    uniqueRegistryDependencies = Array.from(new Set(registryDependencies));
                    return [4 /*yield*/, fetchRegistry(uniqueRegistryDependencies, config.url)];
                case 6:
                    result = _a.sent();
                    payload = zod_1.z.array(schema_1.registryItemSchema).parse(result);
                    if (!payload) {
                        return [2 /*return*/, null];
                    }
                    if (!(names.includes("index") && config.tailwind.baseColor)) return [3 /*break*/, 8];
                    return [4 /*yield*/, registryGetTheme(config.tailwind.baseColor, config)];
                case 7:
                    theme = _a.sent();
                    if (theme) {
                        payload.unshift(theme);
                    }
                    _a.label = 8;
                case 8:
                    tailwind_1 = {};
                    payload.forEach(function (item) {
                        var _a;
                        tailwind_1 = (0, deepmerge_1.default)(tailwind_1, (_a = item.tailwind) !== null && _a !== void 0 ? _a : {});
                    });
                    cssVars_1 = {};
                    payload.forEach(function (item) {
                        var _a;
                        cssVars_1 = (0, deepmerge_1.default)(cssVars_1, (_a = item.cssVars) !== null && _a !== void 0 ? _a : {});
                    });
                    docs_1 = "";
                    payload.forEach(function (item) {
                        if (item.docs) {
                            docs_1 += "".concat(item.docs, "\n");
                        }
                    });
                    return [2 /*return*/, schema_1.registryResolvedItemsTreeSchema.parse({
                            cssVars: cssVars_1,
                            dependencies: deepmerge_1.default.all(payload.map(function (item) { var _a; return (_a = item.dependencies) !== null && _a !== void 0 ? _a : []; })),
                            devDependencies: deepmerge_1.default.all(payload.map(function (item) { var _a; return (_a = item.devDependencies) !== null && _a !== void 0 ? _a : []; })),
                            docs: docs_1,
                            files: deepmerge_1.default.all(payload.map(function (item) { var _a; return (_a = item.files) !== null && _a !== void 0 ? _a : []; })),
                            tailwind: tailwind_1,
                        })];
                case 9:
                    error_7 = _a.sent();
                    (0, handle_error_1.handleError)(error_7);
                    return [2 /*return*/, null];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function resolveRegistryDependencies(url, config) {
    return __awaiter(this, void 0, void 0, function () {
        function resolveDependencies(itemUrl) {
            return __awaiter(this, void 0, void 0, function () {
                var url, result, item, _i, _a, dependency, error_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            url = getRegistryUrl(isUrl(itemUrl) ? itemUrl : "styles/".concat(config.style, "/").concat(itemUrl, ".json"), config.url);
                            if (visited.has(url)) {
                                return [2 /*return*/];
                            }
                            visited.add(url);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 7, , 8]);
                            return [4 /*yield*/, fetchRegistry([url], config.url)];
                        case 2:
                            result = (_b.sent())[0];
                            item = schema_1.registryItemSchema.parse(result);
                            payload.push(url);
                            if (!item.registryDependencies) return [3 /*break*/, 6];
                            _i = 0, _a = item.registryDependencies;
                            _b.label = 3;
                        case 3:
                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                            dependency = _a[_i];
                            return [4 /*yield*/, resolveDependencies(dependency)];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            error_8 = _b.sent();
                            console.error("Error fetching or parsing registry item at ".concat(itemUrl, ":"), error_8);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        var visited, payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    visited = new Set();
                    payload = [];
                    return [4 /*yield*/, resolveDependencies(url)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, Array.from(new Set(payload))];
            }
        });
    });
}
function registryGetTheme(name, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseColor, theme;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRegistryBaseColor(name)];
                case 1:
                    baseColor = _a.sent();
                    if (!baseColor) {
                        return [2 /*return*/, null];
                    }
                    theme = {
                        cssVars: {
                            dark: {},
                            light: {
                                radius: "0.5rem",
                            },
                        },
                        name: name,
                        tailwind: {
                            config: {
                                theme: {
                                    extend: {
                                        borderRadius: {
                                            lg: "var(--radius)",
                                            md: "calc(var(--radius) - 2px)",
                                            sm: "calc(var(--radius) - 4px)",
                                        },
                                        colors: {},
                                    },
                                },
                            },
                        },
                        type: "registry:theme",
                    };
                    if (config.tailwind.cssVariables) {
                        theme.tailwind.config.theme.extend.colors = __assign(__assign({}, theme.tailwind.config.theme.extend.colors), (0, update_tailwind_config_1.buildTailwindThemeColorsFromCssVars)(baseColor.cssVars.dark));
                        theme.cssVars = {
                            dark: __assign(__assign({}, baseColor.cssVars.dark), theme.cssVars.dark),
                            light: __assign(__assign({}, baseColor.cssVars.light), theme.cssVars.light),
                        };
                    }
                    return [2 /*return*/, theme];
            }
        });
    });
}
function getRegistryUrl(path, registryUrl) {
    if (isUrl(path)) {
        // If the url contains /chat/b/, we assume it's the v0 registry.
        // We need to add the /json suffix if it's missing.
        var url = new URL(path);
        if ((/\/chat\/b\//.exec(url.pathname)) && !url.pathname.endsWith("/json")) {
            url.pathname = "".concat(url.pathname, "/json");
        }
        return url.toString();
    }
    return "".concat(registryUrl || exports.REGISTRY_URL, "/").concat(path);
}
function isUrl(path) {
    try {
        new URL(path);
        return true;
    }
    catch (error) {
        return false;
    }
}
function getDefaultConfig(defaultConfig, registryUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (registryUrl === "https://ui.shadcn.com/r") {
                        return [2 /*return*/, defaultConfig];
                    }
                    return [4 /*yield*/, fetchRegistry(["config.json"], registryUrl, true)];
                case 1:
                    result = (_a.sent())[0];
                    if (result) {
                        return [2 /*return*/, __assign(__assign(__assign({}, defaultConfig), result), { aliases: __assign(__assign({}, defaultConfig.aliases), result.aliases), tailwind: __assign(__assign({}, defaultConfig.tailwind), result.tailwind) })];
                    }
                    return [2 /*return*/, defaultConfig];
            }
        });
    });
}
