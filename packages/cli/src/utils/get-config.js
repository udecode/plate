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
exports.configSchema = exports.rawConfigSchema = exports.DEFAULT_TAILWIND_BASE_COLOR = exports.DEFAULT_TAILWIND_CONFIG = exports.DEFAULT_TAILWIND_CSS = exports.DEFAULT_UTILS = exports.DEFAULT_COMPONENTS = exports.DEFAULT_STYLE = void 0;
exports.getConfig = getConfig;
exports.resolveConfigPaths = resolveConfigPaths;
exports.getRawConfig = getRawConfig;
var cosmiconfig_1 = require("cosmiconfig");
var path_1 = __importDefault(require("path"));
var tsconfig_paths_1 = require("tsconfig-paths");
var zod_1 = require("zod");
var highlighter_1 = require("@/src/utils/highlighter");
var resolve_import_1 = require("@/src/utils/resolve-import");
exports.DEFAULT_STYLE = 'default';
exports.DEFAULT_COMPONENTS = '@/components';
exports.DEFAULT_UTILS = '@/lib/utils';
exports.DEFAULT_TAILWIND_CSS = 'app/globals.css';
exports.DEFAULT_TAILWIND_CONFIG = 'tailwind.config.js';
exports.DEFAULT_TAILWIND_BASE_COLOR = 'slate';
// TODO: Figure out if we want to support all cosmiconfig formats.
// A simple components.json file would be nice.
var explorer = (0, cosmiconfig_1.cosmiconfig)('components', {
    searchPlaces: ['components.json'],
});
var registrySchema = zod_1.z.object({
    aliases: zod_1.z
        .object({
        components: zod_1.z.string().optional(),
        hooks: zod_1.z.string().optional(),
        lib: zod_1.z.string().optional(),
        ui: zod_1.z.string().optional(),
        utils: zod_1.z.string().optional(),
    })
        .optional(),
    rsc: zod_1.z.coerce.boolean().optional(),
    style: zod_1.z.string().optional(),
    tailwind: zod_1.z
        .object({
        baseColor: zod_1.z.string().optional(),
        config: zod_1.z.string().optional(),
        css: zod_1.z.string().optional(),
        cssVariables: zod_1.z.boolean().optional(),
        prefix: zod_1.z.string().optional(),
    })
        .optional(),
    tsx: zod_1.z.coerce.boolean().optional(),
    url: zod_1.z.string(),
});
exports.rawConfigSchema = zod_1.z
    .object({
    $schema: zod_1.z.string().optional(),
    aliases: zod_1.z.object({
        components: zod_1.z.string(),
        hooks: zod_1.z.string().optional(),
        lib: zod_1.z.string().optional(),
        ui: zod_1.z.string().optional(),
        utils: zod_1.z.string(),
    }),
    name: zod_1.z.string().optional(),
    registries: zod_1.z.record(zod_1.z.string(), registrySchema).optional(),
    rsc: zod_1.z.coerce.boolean().default(false),
    style: zod_1.z.string(),
    tailwind: zod_1.z.object({
        baseColor: zod_1.z.string(),
        config: zod_1.z.string(),
        css: zod_1.z.string(),
        cssVariables: zod_1.z.boolean().default(true),
        prefix: zod_1.z.string().default('').optional(),
    }),
    tsx: zod_1.z.coerce.boolean().default(true),
    url: zod_1.z.string().optional(),
})
    .strict();
exports.configSchema = exports.rawConfigSchema.extend({
    resolvedPaths: zod_1.z.object({
        components: zod_1.z.string(),
        cwd: zod_1.z.string(),
        hooks: zod_1.z.string(),
        lib: zod_1.z.string(),
        tailwindConfig: zod_1.z.string(),
        tailwindCss: zod_1.z.string(),
        ui: zod_1.z.string(),
        utils: zod_1.z.string(),
    }),
});
function getConfig(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRawConfig(cwd)];
                case 1:
                    config = _a.sent();
                    if (!config) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, resolveConfigPaths(cwd, config)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function resolveConfigPaths(cwd, config) {
    return __awaiter(this, void 0, void 0, function () {
        var tsConfig, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var _o, _p;
        var _q, _r, _s, _t;
        return __generator(this, function (_u) {
            switch (_u.label) {
                case 0: return [4 /*yield*/, (0, tsconfig_paths_1.loadConfig)(cwd)];
                case 1:
                    tsConfig = _u.sent();
                    if (tsConfig.resultType === 'failed') {
                        throw new Error("Failed to load ".concat(config.tsx ? 'tsconfig' : 'jsconfig', ".json. ").concat((_q = tsConfig.message) !== null && _q !== void 0 ? _q : '').trim());
                    }
                    _b = (_a = exports.configSchema).parse;
                    _c = [__assign({}, config)];
                    _o = {};
                    _p = {};
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.components, tsConfig)];
                case 2:
                    _p.components = _u.sent(),
                        _p.cwd = cwd;
                    if (!config.aliases.hooks) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.hooks, tsConfig)];
                case 3:
                    _d = _u.sent();
                    return [3 /*break*/, 6];
                case 4:
                    _f = (_e = path_1.default).resolve;
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.components, tsConfig)];
                case 5:
                    _d = _f.apply(_e, [(_r = (_u.sent())) !== null && _r !== void 0 ? _r : cwd, '..',
                        'hooks']);
                    _u.label = 6;
                case 6:
                    _p.hooks = _d;
                    if (!config.aliases.lib) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.lib, tsConfig)];
                case 7:
                    _g = _u.sent();
                    return [3 /*break*/, 10];
                case 8:
                    _j = (_h = path_1.default).resolve;
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.utils, tsConfig)];
                case 9:
                    _g = _j.apply(_h, [(_s = (_u.sent())) !== null && _s !== void 0 ? _s : cwd, '..']);
                    _u.label = 10;
                case 10:
                    // TODO: Make this configurable.
                    // For now, we assume the lib and hooks directories are one level up from the components directory.
                    _p.lib = _g,
                        _p.tailwindConfig = path_1.default.resolve(cwd, config.tailwind.config),
                        _p.tailwindCss = path_1.default.resolve(cwd, config.tailwind.css);
                    if (!config.aliases.ui) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.ui, tsConfig)];
                case 11:
                    _k = _u.sent();
                    return [3 /*break*/, 14];
                case 12:
                    _m = (_l = path_1.default).resolve;
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.components, tsConfig)];
                case 13:
                    _k = _m.apply(_l, [(_t = (_u.sent())) !== null && _t !== void 0 ? _t : cwd, 'ui']);
                    _u.label = 14;
                case 14:
                    _p.ui = _k;
                    return [4 /*yield*/, (0, resolve_import_1.resolveImport)(config.aliases.utils, tsConfig)];
                case 15: return [2 /*return*/, _b.apply(_a, [__assign.apply(void 0, _c.concat([(_o.resolvedPaths = (_p.utils = _u.sent(),
                                _p), _o)]))])];
            }
        });
    });
}
function getRawConfig(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var configResult, error_1, componentPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, explorer.search(cwd)];
                case 1:
                    configResult = _a.sent();
                    if (!configResult) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, exports.rawConfigSchema.parse(configResult.config)];
                case 2:
                    error_1 = _a.sent();
                    componentPath = "".concat(cwd, "/components.json");
                    throw new Error("Invalid configuration found in ".concat(highlighter_1.highlighter.info(componentPath), "."));
                case 3: return [2 /*return*/];
            }
        });
    });
}
