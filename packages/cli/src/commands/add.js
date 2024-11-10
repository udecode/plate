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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = exports.addOptionsSchema = void 0;
var commander_1 = require("commander");
var deepmerge_1 = __importDefault(require("deepmerge"));
var path_1 = __importDefault(require("path"));
var prompts_1 = __importDefault(require("prompts"));
var zod_1 = require("zod");
var init_1 = require("@/src/commands/init");
var preflight_add_1 = require("@/src/preflights/preflight-add");
var add_components_1 = require("@/src/utils/add-components");
var create_project_1 = require("@/src/utils/create-project");
var ERRORS = __importStar(require("@/src/utils/errors"));
var handle_error_1 = require("@/src/utils/handle-error");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var registry_1 = require("@/src/utils/registry");
var update_app_index_1 = require("@/src/utils/update-app-index");
var get_config_1 = require("../utils/get-config");
exports.addOptionsSchema = zod_1.z.object({
    all: zod_1.z.boolean(),
    components: zod_1.z.array(zod_1.z.string()).optional(),
    cwd: zod_1.z.string(),
    list: zod_1.z.boolean().optional(),
    overwrite: zod_1.z.boolean(),
    path: zod_1.z.string().optional(),
    registry: zod_1.z.string().optional(),
    silent: zod_1.z.boolean(),
    srcDir: zod_1.z.boolean().optional(),
    yes: zod_1.z.boolean(),
});
exports.add = new commander_1.Command()
    .name('add')
    .description('add a component to your project')
    .argument('[components...]', 'the components to add or a url to the component. Use prefix (eg. plate/editor) to specify registry')
    .option('-y, --yes', 'skip confirmation prompt.', false)
    .option('-o, --overwrite', 'overwrite existing files.', false)
    .option('-c, --cwd <cwd>', 'the working directory. defaults to the current directory.', process.cwd())
    .option('-a, --all', 'add all available components', false)
    .option('-p, --path <path>', 'the path to add the component to.')
    .option('-s, --silent', 'mute output.', false)
    .option('--src-dir', 'use the src directory when creating a new project.', false)
    .option('-r, --registry <registry>', 'registry name or url')
    .option('-l, --list', 'list all available registries', false)
    .action(function (components, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var registry_2, prefixedComponents, options, isTheme, confirm_1, _a, config, errors, proceed, url, res, registryConfig, _b, shouldUpdateAppIndex, projectPath, url, error_1;
    var _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _h.trys.push([0, 17, , 18]);
                registry_2 = opts.registry;
                prefixedComponents = components.map(function (component) {
                    var _a = component.split('/'), prefix = _a[0], name = _a[1];
                    if (name && registry_1.REGISTRY_MAP[prefix]) {
                        registry_2 = prefix;
                        return name;
                    }
                    return component;
                });
                options = exports.addOptionsSchema.parse(__assign({ components: prefixedComponents, cwd: path_1.default.resolve(opts.cwd), registry: registry_2 }, opts));
                isTheme = (_c = options.components) === null || _c === void 0 ? void 0 : _c.some(function (component) {
                    return component.includes('theme-');
                });
                if (!(!options.yes && isTheme)) return [3 /*break*/, 2];
                logger_1.logger.break();
                return [4 /*yield*/, (0, prompts_1.default)({
                        message: highlighter_1.highlighter.warn('You are about to install a new theme. \nExisting CSS variables will be overwritten. Continue?'),
                        name: 'confirm',
                        type: 'confirm',
                    })];
            case 1:
                confirm_1 = (_h.sent()).confirm;
                if (!confirm_1) {
                    logger_1.logger.break();
                    logger_1.logger.log('Theme installation cancelled.');
                    logger_1.logger.break();
                    process.exit(1);
                }
                _h.label = 2;
            case 2: return [4 /*yield*/, (0, preflight_add_1.preFlightAdd)(options)];
            case 3:
                _a = _h.sent(), config = _a.config, errors = _a.errors;
                if (!(!config ||
                    errors[ERRORS.MISSING_CONFIG] ||
                    errors[ERRORS.MISSING_REGISTRY])) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, prompts_1.default)({
                        initial: true,
                        message: errors[ERRORS.MISSING_REGISTRY]
                            ? "You need to add ".concat(highlighter_1.highlighter.info("".concat(options.registry)), " registry to your config. Proceed?")
                            : "You need to create a ".concat(highlighter_1.highlighter.info('components.json'), " file to add components. Proceed?"),
                        name: 'proceed',
                        type: 'confirm',
                    })];
            case 4:
                proceed = (_h.sent()).proceed;
                if (!proceed) {
                    logger_1.logger.break();
                    process.exit(1);
                }
                url = options.registry;
                if (url) {
                    url = (_d = registry_1.REGISTRY_MAP[url]) !== null && _d !== void 0 ? _d : url;
                }
                return [4 /*yield*/, (0, init_1.runInit)({
                        cwd: options.cwd,
                        defaults: false,
                        force: true,
                        isNewProject: false,
                        name: options.registry,
                        silent: true,
                        skipPreflight: false,
                        srcDir: options.srcDir,
                        url: url,
                        yes: true,
                    })];
            case 5:
                config = _h.sent();
                options.cwd = config.resolvedPaths.cwd;
                return [4 /*yield*/, (0, preflight_add_1.preFlightAdd)(options)];
            case 6:
                res = _h.sent();
                // config = res.config!;
                errors = res.errors;
                _h.label = 7;
            case 7: return [4 /*yield*/, getRegistryConfig(config, options)];
            case 8:
                registryConfig = _h.sent();
                if (!!((_e = options.components) === null || _e === void 0 ? void 0 : _e.length)) return [3 /*break*/, 10];
                _b = options;
                return [4 /*yield*/, promptForRegistryComponents(options, registryConfig.url)];
            case 9:
                _b.components = _h.sent();
                _h.label = 10;
            case 10:
                shouldUpdateAppIndex = false;
                if (!errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) return [3 /*break*/, 13];
                return [4 /*yield*/, (0, create_project_1.createProject)({
                        cwd: options.cwd,
                        force: options.overwrite,
                        srcDir: options.srcDir,
                    })];
            case 11:
                projectPath = (_h.sent()).projectPath;
                if (!projectPath) {
                    logger_1.logger.break();
                    process.exit(1);
                }
                options.cwd = projectPath;
                url = options.registry;
                if (url) {
                    url = (_f = registry_1.REGISTRY_MAP[url]) !== null && _f !== void 0 ? _f : url;
                }
                return [4 /*yield*/, (0, init_1.runInit)({
                        cwd: options.cwd,
                        defaults: false,
                        force: true,
                        isNewProject: true,
                        name: options.registry,
                        silent: true,
                        skipPreflight: true,
                        srcDir: options.srcDir,
                        url: url,
                        yes: true,
                    })];
            case 12:
                config = _h.sent();
                options.cwd = config.resolvedPaths.cwd;
                shouldUpdateAppIndex =
                    ((_g = options.components) === null || _g === void 0 ? void 0 : _g.length) === 1 &&
                        !!/\/chat\/b\//.exec(options.components[0]);
                _h.label = 13;
            case 13:
                if (!config) {
                    throw new Error("Failed to read config at ".concat(highlighter_1.highlighter.info(options.cwd), "."));
                }
                return [4 /*yield*/, (0, add_components_1.addComponents)(options.components, registryConfig, options)];
            case 14:
                _h.sent();
                if (!shouldUpdateAppIndex) return [3 /*break*/, 16];
                return [4 /*yield*/, (0, update_app_index_1.updateAppIndex)(options.components[0], config)];
            case 15:
                _h.sent();
                _h.label = 16;
            case 16: return [3 /*break*/, 18];
            case 17:
                error_1 = _h.sent();
                logger_1.logger.break();
                (0, handle_error_1.handleError)(error_1);
                return [3 /*break*/, 18];
            case 18: return [2 /*return*/];
        }
    });
}); });
function getRegistryConfig(config, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var registry, selectedRegistry, _a, registryConfig;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    registry = opts.registry;
                    if (!(opts.list &&
                        config.registries &&
                        Object.keys(config.registries).length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, prompts_1.default)({
                            choices: __spreadArray([
                                { title: 'default', value: 'default' }
                            ], Object.entries(config.registries).map(function (_a) {
                                var name = _a[0];
                                return ({
                                    title: name,
                                    value: name,
                                });
                            }), true),
                            message: 'Select a registry:',
                            name: 'selectedRegistry',
                            type: 'select',
                        })];
                case 1:
                    selectedRegistry = (_d.sent()).selectedRegistry;
                    if (!(selectedRegistry === 'default')) return [3 /*break*/, 2];
                    _a = __assign({}, config);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, get_config_1.resolveConfigPaths)(opts.cwd, (0, deepmerge_1.default)(config, config.registries[selectedRegistry]))];
                case 3:
                    _a = _d.sent();
                    _d.label = 4;
                case 4: return [2 /*return*/, _a];
                case 5:
                    if (!registry) return [3 /*break*/, 11];
                    if (!(registry.startsWith('http://') || registry.startsWith('https://'))) return [3 /*break*/, 8];
                    if (!config.registries) return [3 /*break*/, 7];
                    registryConfig = (_b = Object.values(config.registries)) === null || _b === void 0 ? void 0 : _b.find(function (reg) { return reg.url === registry; });
                    if (!registryConfig) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, get_config_1.resolveConfigPaths)(opts.cwd, (0, deepmerge_1.default)(config, registryConfig))];
                case 6: return [2 /*return*/, _d.sent()];
                case 7: return [2 /*return*/, __assign(__assign({}, config), { url: registry })];
                case 8:
                    if (!((_c = config.registries) === null || _c === void 0 ? void 0 : _c[registry])) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, get_config_1.resolveConfigPaths)(opts.cwd, (0, deepmerge_1.default)(config, config.registries[registry]))];
                case 9: return [2 /*return*/, _d.sent()];
                case 10:
                    // If it's neither a URL nor a known registry name, warn the user and fallback to the default config
                    logger_1.logger.warn("Registry \"".concat(registry, "\" not found in configuration. Using the default registry."));
                    return [2 /*return*/, __assign({}, config)];
                case 11: 
                // If no registry is specified and no registries in config, use the default config
                return [2 /*return*/, __assign({}, config)];
            }
        });
    });
}
function promptForRegistryComponents(options, registryUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var registryIndex, components, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, registry_1.getRegistryIndex)(registryUrl)];
                case 1:
                    registryIndex = _b.sent();
                    if (!registryIndex) {
                        logger_1.logger.break();
                        (0, handle_error_1.handleError)(new Error('Failed to fetch registry index.'));
                        return [2 /*return*/, []];
                    }
                    if (options.all) {
                        return [2 /*return*/, registryIndex.map(function (entry) { return entry.name; })];
                    }
                    if ((_a = options.components) === null || _a === void 0 ? void 0 : _a.length) {
                        return [2 /*return*/, options.components];
                    }
                    return [4 /*yield*/, (0, prompts_1.default)({
                            choices: registryIndex
                                .filter(function (entry) { return entry.type === 'registry:ui'; })
                                .map(function (entry) {
                                var _a;
                                return ({
                                    selected: options.all ? true : (_a = options.components) === null || _a === void 0 ? void 0 : _a.includes(entry.name),
                                    title: entry.name,
                                    value: entry.name,
                                });
                            }),
                            hint: 'Space to select. A to toggle all. Enter to submit.',
                            instructions: false,
                            message: 'Which components would you like to add?',
                            name: 'components',
                            type: 'multiselect',
                        })];
                case 2:
                    components = (_b.sent()).components;
                    if (!(components === null || components === void 0 ? void 0 : components.length)) {
                        logger_1.logger.warn('No components selected. Exiting.');
                        logger_1.logger.info('');
                        process.exit(1);
                    }
                    result = zod_1.z.array(zod_1.z.string()).safeParse(components);
                    if (!result.success) {
                        logger_1.logger.error('');
                        (0, handle_error_1.handleError)(new Error('Something went wrong. Please try again.'));
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, result.data];
            }
        });
    });
}
