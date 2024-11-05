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
exports.getProjectInfo = getProjectInfo;
exports.getTailwindCssFile = getTailwindCssFile;
exports.getTailwindConfigFile = getTailwindConfigFile;
exports.getTsConfigAliasPrefix = getTsConfigAliasPrefix;
exports.isTypeScriptProject = isTypeScriptProject;
exports.getTsConfig = getTsConfig;
exports.getProjectConfig = getProjectConfig;
var fast_glob_1 = __importDefault(require("fast-glob"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var tsconfig_paths_1 = require("tsconfig-paths");
var frameworks_1 = require("@/src/utils/frameworks");
var get_config_1 = require("@/src/utils/get-config");
var get_package_info_1 = require("@/src/utils/get-package-info");
var registry_1 = require("@/src/utils/registry");
var PROJECT_SHARED_IGNORE = [
    '**/node_modules/**',
    '.next',
    'public',
    'dist',
    'build',
];
function getProjectInfo(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, configFiles, isSrcDir, isTsx, tailwindConfigFile, tailwindCssFile, aliasPrefix, packageJson, isUsingAppDir, type;
        var _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        fast_glob_1.default.glob('**/{next,vite,astro}.config.*|gatsby-config.*|composer.json', {
                            cwd: cwd,
                            deep: 3,
                            ignore: PROJECT_SHARED_IGNORE,
                        }),
                        fs_extra_1.default.pathExists(path_1.default.resolve(cwd, 'src')),
                        isTypeScriptProject(cwd),
                        getTailwindConfigFile(cwd),
                        getTailwindCssFile(cwd),
                        getTsConfigAliasPrefix(cwd),
                        (0, get_package_info_1.getPackageInfo)(cwd, false),
                    ])];
                case 1:
                    _a = _h.sent(), configFiles = _a[0], isSrcDir = _a[1], isTsx = _a[2], tailwindConfigFile = _a[3], tailwindCssFile = _a[4], aliasPrefix = _a[5], packageJson = _a[6];
                    return [4 /*yield*/, fs_extra_1.default.pathExists(path_1.default.resolve(cwd, "".concat(isSrcDir ? 'src/' : '', "app")))];
                case 2:
                    isUsingAppDir = _h.sent();
                    type = {
                        aliasPrefix: aliasPrefix,
                        framework: frameworks_1.FRAMEWORKS.manual,
                        isRSC: false,
                        isSrcDir: isSrcDir,
                        isTsx: isTsx,
                        tailwindConfigFile: tailwindConfigFile,
                        tailwindCssFile: tailwindCssFile,
                    };
                    // Next.js.
                    if ((_b = configFiles.find(function (file) { return file.startsWith('next.config.'); })) === null || _b === void 0 ? void 0 : _b.length) {
                        type.framework = isUsingAppDir
                            ? frameworks_1.FRAMEWORKS['next-app']
                            : frameworks_1.FRAMEWORKS['next-pages'];
                        type.isRSC = isUsingAppDir;
                        return [2 /*return*/, type];
                    }
                    // Astro.
                    if ((_c = configFiles.find(function (file) { return file.startsWith('astro.config.'); })) === null || _c === void 0 ? void 0 : _c.length) {
                        type.framework = frameworks_1.FRAMEWORKS.astro;
                        return [2 /*return*/, type];
                    }
                    // Gatsby.
                    if ((_d = configFiles.find(function (file) { return file.startsWith('gatsby-config.'); })) === null || _d === void 0 ? void 0 : _d.length) {
                        type.framework = frameworks_1.FRAMEWORKS.gatsby;
                        return [2 /*return*/, type];
                    }
                    // Laravel.
                    if ((_e = configFiles.find(function (file) { return file.startsWith('composer.json'); })) === null || _e === void 0 ? void 0 : _e.length) {
                        type.framework = frameworks_1.FRAMEWORKS.laravel;
                        return [2 /*return*/, type];
                    }
                    // Remix.
                    if (Object.keys((_f = packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies) !== null && _f !== void 0 ? _f : {}).find(function (dep) {
                        return dep.startsWith('@remix-run/');
                    })) {
                        type.framework = frameworks_1.FRAMEWORKS.remix;
                        return [2 /*return*/, type];
                    }
                    // Vite.
                    // Some Remix templates also have a vite.config.* file.
                    // We'll assume that it got caught by the Remix check above.
                    if ((_g = configFiles.find(function (file) { return file.startsWith('vite.config.'); })) === null || _g === void 0 ? void 0 : _g.length) {
                        type.framework = frameworks_1.FRAMEWORKS.vite;
                        return [2 /*return*/, type];
                    }
                    return [2 /*return*/, type];
            }
        });
    });
}
function getTailwindCssFile(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, files_1, file, contents;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fast_glob_1.default.glob(['**/*.css', '**/*.scss'], {
                        cwd: cwd,
                        deep: 5,
                        ignore: PROJECT_SHARED_IGNORE,
                    })];
                case 1:
                    files = _a.sent();
                    if (files.length === 0) {
                        return [2 /*return*/, null];
                    }
                    _i = 0, files_1 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 5];
                    file = files_1[_i];
                    return [4 /*yield*/, fs_extra_1.default.readFile(path_1.default.resolve(cwd, file), 'utf8')];
                case 3:
                    contents = _a.sent();
                    // Assume that if the file contains `@tailwind base` it's the main css file.
                    if (contents.includes('@tailwind base')) {
                        return [2 /*return*/, file];
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, null];
            }
        });
    });
}
function getTailwindConfigFile(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fast_glob_1.default.glob('tailwind.config.*', {
                        cwd: cwd,
                        deep: 3,
                        ignore: PROJECT_SHARED_IGNORE,
                    })];
                case 1:
                    files = _a.sent();
                    if (files.length === 0) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, files[0]];
            }
        });
    });
}
function getTsConfigAliasPrefix(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var tsConfig, _i, _a, _b, alias, paths;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, tsconfig_paths_1.loadConfig)(cwd)];
                case 1:
                    tsConfig = _d.sent();
                    if ((tsConfig === null || tsConfig === void 0 ? void 0 : tsConfig.resultType) === 'failed' || !(tsConfig === null || tsConfig === void 0 ? void 0 : tsConfig.paths)) {
                        return [2 /*return*/, null];
                    }
                    // This assume that the first alias is the prefix.
                    for (_i = 0, _a = Object.entries(tsConfig.paths); _i < _a.length; _i++) {
                        _b = _a[_i], alias = _b[0], paths = _b[1];
                        if (paths.includes('./*') ||
                            paths.includes('./src/*') ||
                            paths.includes('./app/*') ||
                            paths.includes('./resources/js/*') // Laravel.
                        ) {
                            return [2 /*return*/, (_c = alias.at(0)) !== null && _c !== void 0 ? _c : null];
                        }
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function isTypeScriptProject(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fast_glob_1.default.glob('tsconfig.*', {
                        cwd: cwd,
                        deep: 1,
                        ignore: PROJECT_SHARED_IGNORE,
                    })];
                case 1:
                    files = _a.sent();
                    return [2 /*return*/, files.length > 0];
            }
        });
    });
}
function getTsConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var tsconfigPath, tsconfig, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    tsconfigPath = path_1.default.join('tsconfig.json');
                    return [4 /*yield*/, fs_extra_1.default.readJSON(tsconfigPath)];
                case 1:
                    tsconfig = _a.sent();
                    if (!tsconfig) {
                        throw new Error('tsconfig.json is missing');
                    }
                    return [2 /*return*/, tsconfig];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getProjectConfig(cwd_1) {
    return __awaiter(this, arguments, void 0, function (cwd, defaultProjectInfo) {
        var _a, existingConfig, projectInfo, config;
        if (defaultProjectInfo === void 0) { defaultProjectInfo = null; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        (0, get_config_1.getConfig)(cwd),
                        defaultProjectInfo
                            ? Promise.resolve(defaultProjectInfo)
                            : getProjectInfo(cwd),
                    ])];
                case 1:
                    _a = _b.sent(), existingConfig = _a[0], projectInfo = _a[1];
                    if (existingConfig) {
                        return [2 /*return*/, [__assign(__assign({}, existingConfig), { url: registry_1.REGISTRY_URL }), false]];
                    }
                    if (!(projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.tailwindConfigFile) || !projectInfo.tailwindCssFile) {
                        return [2 /*return*/, null];
                    }
                    config = {
                        $schema: 'https://ui.shadcn.com/schema.json',
                        aliases: {
                            components: "".concat(projectInfo.aliasPrefix, "/components"),
                            hooks: "".concat(projectInfo.aliasPrefix, "/hooks"),
                            lib: "".concat(projectInfo.aliasPrefix, "/lib"),
                            ui: "".concat(projectInfo.aliasPrefix, "/components/ui"),
                            utils: "".concat(projectInfo.aliasPrefix, "/lib/utils"),
                        },
                        rsc: projectInfo.isRSC,
                        style: 'new-york',
                        tailwind: {
                            baseColor: 'zinc',
                            config: projectInfo.tailwindConfigFile,
                            css: projectInfo.tailwindCssFile,
                            cssVariables: true,
                            prefix: '',
                        },
                        tsx: projectInfo.isTsx,
                        url: registry_1.REGISTRY_URL,
                    };
                    return [4 /*yield*/, (0, get_config_1.resolveConfigPaths)(cwd, config)];
                case 2: return [2 /*return*/, [_b.sent(), true]];
            }
        });
    });
}
