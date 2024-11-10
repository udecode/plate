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
exports.updateDependencies = updateDependencies;
var execa_1 = require("execa");
var prompts_1 = __importDefault(require("prompts"));
var get_package_info_1 = require("@/src/utils/get-package-info");
var get_package_manager_1 = require("@/src/utils/get-package-manager");
var logger_1 = require("@/src/utils/logger");
var spinner_1 = require("@/src/utils/spinner");
function updateDependencies(dependencies, config, options) {
    return __awaiter(this, void 0, void 0, function () {
        var dependenciesSpinner, packageManager, flag, confirmation;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dependencies = Array.from(new Set(dependencies));
                    if (!(dependencies === null || dependencies === void 0 ? void 0 : dependencies.length)) {
                        return [2 /*return*/];
                    }
                    options = __assign({ silent: false }, options);
                    dependenciesSpinner = (_a = (0, spinner_1.spinner)("Installing dependencies.", {
                        silent: options.silent,
                    })) === null || _a === void 0 ? void 0 : _a.start();
                    return [4 /*yield*/, (0, get_package_manager_1.getPackageManager)(config.resolvedPaths.cwd)];
                case 1:
                    packageManager = _b.sent();
                    flag = '';
                    if (!(isUsingReact19(config) && packageManager === 'npm')) return [3 /*break*/, 3];
                    dependenciesSpinner.stopAndPersist();
                    logger_1.logger.warn('\nIt looks like you are using React 19. \nSome packages may fail to install due to peer dependency issues (see https://ui.shadcn.com/react-19).\n');
                    return [4 /*yield*/, (0, prompts_1.default)([
                            {
                                choices: [
                                    { title: 'Use --force', value: 'force' },
                                    { title: 'Use --legacy-peer-deps', value: 'legacy-peer-deps' },
                                ],
                                message: 'How would you like to proceed?',
                                name: 'flag',
                                type: 'select',
                            },
                        ])];
                case 2:
                    confirmation = _b.sent();
                    if (confirmation) {
                        flag = confirmation.flag;
                    }
                    _b.label = 3;
                case 3:
                    dependenciesSpinner === null || dependenciesSpinner === void 0 ? void 0 : dependenciesSpinner.start();
                    return [4 /*yield*/, (0, execa_1.execa)(packageManager, __spreadArray(__spreadArray([
                            packageManager === 'npm' ? 'install' : 'add'
                        ], (packageManager === 'npm' && flag ? ["--".concat(flag)] : []), true), dependencies, true), {
                            cwd: config.resolvedPaths.cwd,
                        })];
                case 4:
                    _b.sent();
                    dependenciesSpinner === null || dependenciesSpinner === void 0 ? void 0 : dependenciesSpinner.succeed();
                    return [2 /*return*/];
            }
        });
    });
}
function isUsingReact19(config) {
    var _a;
    var packageInfo = (0, get_package_info_1.getPackageInfo)(config.resolvedPaths.cwd);
    if (!((_a = packageInfo === null || packageInfo === void 0 ? void 0 : packageInfo.dependencies) === null || _a === void 0 ? void 0 : _a.react)) {
        return false;
    }
    return /^[\^~]?19(?:\.\d+)*(?:-.*)?$/.test(packageInfo.dependencies.react);
}
