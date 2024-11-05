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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.init = exports.initOptionsSchema = exports.registryMap = void 0;
exports.runInit = runInit;
var commander_1 = require("commander");
var deepmerge_1 = __importDefault(require("deepmerge"));
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var prompts_1 = __importDefault(require("prompts"));
var zod_1 = require("zod");
var preflight_init_1 = require("@/src/preflights/preflight-init");
var add_components_1 = require("@/src/utils/add-components");
var create_project_1 = require("@/src/utils/create-project");
var ERRORS = __importStar(require("@/src/utils/errors"));
var get_config_1 = require("@/src/utils/get-config");
var get_project_info_1 = require("@/src/utils/get-project-info");
var handle_error_1 = require("@/src/utils/handle-error");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var registry_1 = require("@/src/utils/registry");
var spinner_1 = require("@/src/utils/spinner");
var update_tailwind_content_1 = require("@/src/utils/updaters/update-tailwind-content");
var is_different_1 = require("../utils/is-different");
exports.registryMap = {
    magic: 'https://magicui.design/r',
    plate: 'https://platejs.org/r',
    shadcn: registry_1.REGISTRY_URL,
};
exports.initOptionsSchema = zod_1.z.object({
    components: zod_1.z.array(zod_1.z.string()).optional(),
    cwd: zod_1.z.string(),
    defaults: zod_1.z.boolean(),
    force: zod_1.z.boolean(),
    isNewProject: zod_1.z.boolean(),
    name: zod_1.z.string().optional(),
    pm: zod_1.z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional(),
    silent: zod_1.z.boolean(),
    srcDir: zod_1.z.boolean().optional(),
    url: zod_1.z.string().optional(),
    yes: zod_1.z.boolean(),
});
exports.init = new commander_1.Command()
    .name('init')
    .description('initialize your project and install dependencies')
    .argument('[components...]', 'the components to add or a url to the component.')
    .option('-y, --yes', 'skip confirmation prompt.', true)
    .option('-d, --defaults,', 'use default configuration.', false)
    .option('-f, --force', 'force overwrite of existing configuration.', false)
    .option('-c, --cwd <cwd>', 'the working directory. defaults to the current directory.', process.cwd())
    .option('-s, --silent', 'mute output.', false)
    .option('--src-dir', 'use the src directory when creating a new project.', false)
    .option('-n, --name <name>', 'registry name')
    .option('--pm <pm>', 'package manager to use (npm, pnpm, yarn, bun)')
    .action(function (components, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var url, name_1, actualComponents, registry, options, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                url = registry_1.REGISTRY_URL;
                name_1 = opts.name;
                actualComponents = __spreadArray([], components, true);
                if (components.length > 0) {
                    registry = registry_1.REGISTRY_MAP[components[0]];
                    if (registry) {
                        url = registry;
                        name_1 = components[0];
                        actualComponents = components.slice(1);
                    }
                    else if (components[0].startsWith('http')) {
                        url = components[0];
                        name_1 = components[0];
                        actualComponents = components.slice(1);
                    }
                }
                options = exports.initOptionsSchema.parse(__assign(__assign({ cwd: path_1.default.resolve(opts.cwd), isNewProject: false }, opts), { components: actualComponents, name: name_1, url: url }));
                // DIFF END
                return [4 /*yield*/, runInit(options)];
            case 1:
                // DIFF END
                _a.sent();
                logger_1.logger.log("".concat(highlighter_1.highlighter.success('Success!'), " Project initialization completed.\nYou may now add components."));
                logger_1.logger.break();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                logger_1.logger.break();
                (0, handle_error_1.handleError)(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
function runInit(options) {
    return __awaiter(this, void 0, void 0, function () {
        var projectInfo, preflight, projectPath, res, projectConfig, isNew, config, newConfig, registryName, url, rest, _a, res_1, res_2, _b, proceed, componentSpinner, targetPath, registryConfig, registry, fullConfig, components, _c, _d, _e, _f;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!options.skipPreflight) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, get_project_info_1.getProjectInfo)(options.cwd)];
                case 1:
                    projectInfo = _h.sent();
                    return [3 /*break*/, 6];
                case 2: return [4 /*yield*/, (0, preflight_init_1.preFlightInit)(options)];
                case 3:
                    preflight = _h.sent();
                    if (!preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, create_project_1.createProject)(options)];
                case 4:
                    projectPath = (_h.sent()).projectPath;
                    if (!projectPath) {
                        process.exit(1);
                    }
                    options.cwd = projectPath;
                    options.isNewProject = true;
                    _h.label = 5;
                case 5:
                    projectInfo = preflight.projectInfo;
                    _h.label = 6;
                case 6: return [4 /*yield*/, (0, get_project_info_1.getProjectConfig)(options.cwd, projectInfo)];
                case 7:
                    res = _h.sent();
                    projectConfig = res === null || res === void 0 ? void 0 : res[0];
                    isNew = res === null || res === void 0 ? void 0 : res[1];
                    if (!projectConfig) return [3 /*break*/, 18];
                    if (!(isNew || options.url === projectConfig.url)) return [3 /*break*/, 15];
                    if (!(options.url === projectConfig.url)) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, registry_1.getDefaultConfig)(projectConfig, options.url)];
                case 8:
                    projectConfig = _h.sent();
                    return [4 /*yield*/, promptForMinimalConfig(projectConfig, options)];
                case 9:
                    // Updating top-level config
                    config = _h.sent();
                    return [3 /*break*/, 14];
                case 10:
                    url = options.url, rest = __rest(options, ["url"]);
                    _a = promptForMinimalConfig;
                    return [4 /*yield*/, (0, registry_1.getDefaultConfig)(projectConfig)];
                case 11: return [4 /*yield*/, _a.apply(void 0, [_h.sent(), __assign({}, rest)])];
                case 12:
                    newConfig = _h.sent();
                    return [4 /*yield*/, promptForNestedRegistryConfig(newConfig, options)];
                case 13:
                    res_1 = _h.sent();
                    config = res_1.config;
                    registryName = res_1.name;
                    _h.label = 14;
                case 14: return [3 /*break*/, 17];
                case 15: return [4 /*yield*/, promptForNestedRegistryConfig(projectConfig, options)];
                case 16:
                    res_2 = _h.sent();
                    config = res_2.config;
                    registryName = res_2.name;
                    _h.label = 17;
                case 17: return [3 /*break*/, 21];
                case 18:
                    _b = promptForConfig;
                    return [4 /*yield*/, (0, get_config_1.getConfig)(options.cwd)];
                case 19: return [4 /*yield*/, _b.apply(void 0, [_h.sent(), options.url])];
                case 20:
                    // New configuration
                    config = _h.sent();
                    _h.label = 21;
                case 21:
                    if (!!options.yes) return [3 /*break*/, 23];
                    return [4 /*yield*/, (0, prompts_1.default)({
                            initial: true,
                            message: "Write configuration to ".concat(highlighter_1.highlighter.info('components.json'), ". Proceed?"),
                            name: 'proceed',
                            type: 'confirm',
                        })];
                case 22:
                    proceed = (_h.sent()).proceed;
                    if (!proceed) {
                        process.exit(0);
                    }
                    _h.label = 23;
                case 23:
                    if (config.url === registry_1.REGISTRY_URL) {
                        delete config.url;
                    }
                    componentSpinner = (0, spinner_1.spinner)("Writing components.json.").start();
                    targetPath = path_1.default.resolve(options.cwd, 'components.json');
                    return [4 /*yield*/, fs_1.promises.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf8')];
                case 24:
                    _h.sent();
                    componentSpinner.succeed();
                    registryConfig = config;
                    if (registryName) {
                        registry = (_g = config.registries) === null || _g === void 0 ? void 0 : _g[registryName];
                        if (registry) {
                            registryConfig = (0, deepmerge_1.default)(config, registry);
                        }
                    }
                    return [4 /*yield*/, (0, get_config_1.resolveConfigPaths)(options.cwd, registryConfig)];
                case 25:
                    fullConfig = _h.sent();
                    components = __spreadArray(['index'], (options.components || []), true);
                    if (!newConfig) return [3 /*break*/, 28];
                    _c = add_components_1.addComponents;
                    _d = [components];
                    return [4 /*yield*/, (0, get_config_1.resolveConfigPaths)(options.cwd, newConfig)];
                case 26: return [4 /*yield*/, _c.apply(void 0, _d.concat([_h.sent(), {
                            isNewProject: options.isNewProject || (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.name) === 'next-app',
                            // Init will always overwrite files.
                            overwrite: true,
                            silent: options.silent,
                        }]))];
                case 27:
                    _h.sent();
                    _h.label = 28;
                case 28: return [4 /*yield*/, (0, add_components_1.addComponents)(components, fullConfig, {
                        isNewProject: options.isNewProject || (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.name) === 'next-app',
                        // Init will always overwrite files.
                        overwrite: true,
                        registryName: registryName,
                        silent: options.silent,
                    })];
                case 29:
                    _h.sent();
                    if (!(options.isNewProject && options.srcDir)) return [3 /*break*/, 34];
                    if (!newConfig) return [3 /*break*/, 32];
                    _e = update_tailwind_content_1.updateTailwindContent;
                    _f = [['./src/**/*.{js,ts,jsx,tsx,mdx}']];
                    return [4 /*yield*/, (0, get_config_1.resolveConfigPaths)(options.cwd, newConfig)];
                case 30: return [4 /*yield*/, _e.apply(void 0, _f.concat([_h.sent(), {
                            silent: options.silent,
                        }]))];
                case 31:
                    _h.sent();
                    _h.label = 32;
                case 32: return [4 /*yield*/, (0, update_tailwind_content_1.updateTailwindContent)(['./src/**/*.{js,ts,jsx,tsx,mdx}'], fullConfig, {
                        silent: options.silent,
                    })];
                case 33:
                    _h.sent();
                    _h.label = 34;
                case 34: return [2 /*return*/, fullConfig];
            }
        });
    });
}
function promptForConfig() {
    return __awaiter(this, arguments, void 0, function (defaultConfig, registryUrl) {
        var _a, styles, baseColors, options;
        var _b, _c, _d, _e, _f, _g, _h;
        if (defaultConfig === void 0) { defaultConfig = null; }
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        (0, registry_1.getRegistryStyles)(registryUrl),
                        (0, registry_1.getRegistryBaseColors)(),
                    ])];
                case 1:
                    _a = _j.sent(), styles = _a[0], baseColors = _a[1];
                    logger_1.logger.info('');
                    return [4 /*yield*/, (0, prompts_1.default)(__spreadArray(__spreadArray([
                            {
                                active: 'yes',
                                inactive: 'no',
                                initial: (_b = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.tsx) !== null && _b !== void 0 ? _b : true,
                                message: "Would you like to use ".concat(highlighter_1.highlighter.info('TypeScript'), " (recommended)?"),
                                name: 'typescript',
                                type: 'toggle',
                            }
                        ], (styles.length > 1
                            ? [
                                {
                                    choices: styles.map(function (style) { return ({
                                        title: style.label,
                                        value: style.name,
                                    }); }),
                                    message: "Which ".concat(highlighter_1.highlighter.info('style'), " would you like to use?"),
                                    name: 'style',
                                    type: 'select',
                                },
                            ]
                            : []), true), [
                            {
                                choices: baseColors.map(function (color) { return ({
                                    title: color.label,
                                    value: color.name,
                                }); }),
                                message: "Which color would you like to use as the ".concat(highlighter_1.highlighter.info('base color'), "?"),
                                name: 'tailwindBaseColor',
                                type: 'select',
                            },
                            {
                                initial: (_c = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.tailwind.css) !== null && _c !== void 0 ? _c : get_config_1.DEFAULT_TAILWIND_CSS,
                                message: "Where is your ".concat(highlighter_1.highlighter.info('global CSS'), " file?"),
                                name: 'tailwindCss',
                                type: 'text',
                            },
                            {
                                active: 'yes',
                                inactive: 'no',
                                initial: (_d = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.tailwind.cssVariables) !== null && _d !== void 0 ? _d : true,
                                message: "Would you like to use ".concat(highlighter_1.highlighter.info('CSS variables'), " for theming?"),
                                name: 'tailwindCssVariables',
                                type: 'toggle',
                            },
                            {
                                initial: '',
                                message: "Are you using a custom ".concat(highlighter_1.highlighter.info('tailwind prefix eg. tw-'), "? (Leave blank if not)"),
                                name: 'tailwindPrefix',
                                type: 'text',
                            },
                            {
                                initial: (_e = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.tailwind.config) !== null && _e !== void 0 ? _e : get_config_1.DEFAULT_TAILWIND_CONFIG,
                                message: "Where is your ".concat(highlighter_1.highlighter.info('tailwind.config.js'), " located?"),
                                name: 'tailwindConfig',
                                type: 'text',
                            },
                            {
                                initial: (_f = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.aliases.components) !== null && _f !== void 0 ? _f : get_config_1.DEFAULT_COMPONENTS,
                                message: "Configure the import alias for ".concat(highlighter_1.highlighter.info('components'), ":"),
                                name: 'components',
                                type: 'text',
                            },
                            {
                                initial: (_g = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.aliases.utils) !== null && _g !== void 0 ? _g : get_config_1.DEFAULT_UTILS,
                                message: "Configure the import alias for ".concat(highlighter_1.highlighter.info('utils'), ":"),
                                name: 'utils',
                                type: 'text',
                            },
                            {
                                active: 'yes',
                                inactive: 'no',
                                initial: (_h = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.rsc) !== null && _h !== void 0 ? _h : true,
                                message: "Are you using ".concat(highlighter_1.highlighter.info('React Server Components'), "?"),
                                name: 'rsc',
                                type: 'toggle',
                            },
                        ], false))];
                case 2:
                    options = _j.sent();
                    return [2 /*return*/, get_config_1.rawConfigSchema.parse({
                            $schema: 'https://ui.shadcn.com/schema.json',
                            aliases: {
                                components: options.components,
                                hooks: options.components.replace(/\/components$/, 'hooks'),
                                // TODO: fix this.
                                lib: options.components.replace(/\/components$/, 'lib'),
                                utils: options.utils,
                            },
                            rsc: options.rsc,
                            style: options.style,
                            tailwind: {
                                baseColor: options.tailwindBaseColor,
                                config: options.tailwindConfig,
                                css: options.tailwindCss,
                                cssVariables: options.tailwindCssVariables,
                                prefix: options.tailwindPrefix,
                            },
                            tsx: options.typescript,
                            url: options.url,
                        })];
            }
        });
    });
}
function promptForMinimalConfig(defaultConfig, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var style, baseColor, cssVariables, _a, styles, baseColors, options;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    style = defaultConfig.style;
                    baseColor = defaultConfig.tailwind.baseColor;
                    cssVariables = defaultConfig.tailwind.cssVariables;
                    if (!!opts.defaults) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all([
                            (0, registry_1.getRegistryStyles)(opts.url),
                            (0, registry_1.getRegistryBaseColors)(),
                        ])];
                case 1:
                    _a = _e.sent(), styles = _a[0], baseColors = _a[1];
                    return [4 /*yield*/, (0, prompts_1.default)(__spreadArray(__spreadArray([], (styles.length > 1
                            ? [
                                {
                                    choices: styles.map(function (style) { return ({
                                        title: style.label,
                                        value: style.name,
                                    }); }),
                                    initial: styles.findIndex(function (s) { return s.name === style; }),
                                    message: "Which ".concat(highlighter_1.highlighter.info('style'), " would you like to use?"),
                                    name: 'style',
                                    type: 'select',
                                },
                            ]
                            : []), true), [
                            {
                                choices: baseColors.map(function (color) { return ({
                                    title: color.label,
                                    value: color.name,
                                }); }),
                                message: "Which color would you like to use as the ".concat(highlighter_1.highlighter.info('base color'), "?"),
                                name: 'tailwindBaseColor',
                                type: 'select',
                            },
                            {
                                active: 'yes',
                                inactive: 'no',
                                initial: defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.tailwind.cssVariables,
                                message: "Would you like to use ".concat(highlighter_1.highlighter.info('CSS variables'), " for theming?"),
                                name: 'tailwindCssVariables',
                                type: 'toggle',
                            },
                        ], false))];
                case 2:
                    options = _e.sent();
                    style = (_b = options.style) !== null && _b !== void 0 ? _b : style;
                    baseColor = (_c = options.tailwindBaseColor) !== null && _c !== void 0 ? _c : baseColor;
                    cssVariables = (_d = options.tailwindCssVariables) !== null && _d !== void 0 ? _d : cssVariables;
                    _e.label = 3;
                case 3: return [2 /*return*/, get_config_1.rawConfigSchema.parse({
                        $schema: defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.$schema,
                        aliases: defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.aliases,
                        registries: defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.registries,
                        rsc: defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.rsc,
                        style: style,
                        tailwind: __assign(__assign({}, defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.tailwind), { baseColor: baseColor, cssVariables: cssVariables }),
                        tsx: defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.tsx,
                        url: opts.url,
                    })];
            }
        });
    });
}
function promptForNestedRegistryConfig(defaultConfig, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var nestedDefaultConfig, name, newConfig, relevantFields, defaultConfigSubset, newConfigSubset, registryConfig, resolvedPaths, topLevelConfig;
        var _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, registry_1.getDefaultConfig)(__assign({}, defaultConfig), opts.url)];
                case 1:
                    nestedDefaultConfig = _d.sent();
                    name = (_c = (_b = opts.name) !== null && _b !== void 0 ? _b : nestedDefaultConfig.name) !== null && _c !== void 0 ? _c : opts.url;
                    logger_1.logger.info('Initializing ' + name + ' registry...');
                    return [4 /*yield*/, promptForMinimalConfig(nestedDefaultConfig, opts)];
                case 2:
                    newConfig = _d.sent();
                    relevantFields = ['style', 'tailwind', 'rsc', 'tsx', 'aliases'];
                    defaultConfigSubset = Object.fromEntries(relevantFields.map(function (field) { return [field, defaultConfig[field]]; }));
                    newConfigSubset = Object.fromEntries(relevantFields.map(function (field) { return [field, newConfig[field]]; }));
                    registryConfig = (0, is_different_1.getDifferences)(newConfigSubset, defaultConfigSubset);
                    registryConfig.url = opts.url;
                    resolvedPaths = defaultConfig.resolvedPaths, topLevelConfig = __rest(defaultConfig, ["resolvedPaths"]);
                    return [2 /*return*/, {
                            config: __assign(__assign({}, topLevelConfig), { registries: __assign(__assign({}, defaultConfig.registries), (_a = {}, _a[name] = registryConfig, _a)) }),
                            name: name,
                        }];
            }
        });
    });
}
