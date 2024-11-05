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
exports.createProject = createProject;
var execa_1 = require("execa");
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var prompts_1 = __importDefault(require("prompts"));
var get_package_manager_1 = require("@/src/utils/get-package-manager");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var spinner_1 = require("@/src/utils/spinner");
function createProject(options) {
    return __awaiter(this, void 0, void 0, function () {
        var proceed, packageManager, _a, name, projectPath, error_1, createSpinner, args, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    options = __assign({ srcDir: false }, options);
                    if (!!options.force) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, prompts_1.default)({
                            initial: true,
                            message: "The path ".concat(highlighter_1.highlighter.info(options.cwd), " does not contain a package.json file. Would you like to start a new ").concat(highlighter_1.highlighter.info('Next.js'), " project?"),
                            name: 'proceed',
                            type: 'confirm',
                        })];
                case 1:
                    proceed = (_b.sent()).proceed;
                    if (!proceed) {
                        return [2 /*return*/, {
                                projectName: null,
                                projectPath: null,
                            }];
                    }
                    _b.label = 2;
                case 2:
                    _a = options.pm;
                    if (_a) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, get_package_manager_1.getPackageManager)(options.cwd, {
                            withFallback: true,
                        })];
                case 3:
                    _a = (_b.sent());
                    _b.label = 4;
                case 4:
                    packageManager = _a;
                    return [4 /*yield*/, (0, prompts_1.default)({
                            format: function (value) { return value.trim(); },
                            initial: 'my-app',
                            message: "What is your project named?",
                            name: 'name',
                            type: 'text',
                            validate: function (value) {
                                return value.length > 128 ? "Name should be less than 128 characters." : true;
                            },
                        })];
                case 5:
                    name = (_b.sent()).name;
                    projectPath = "".concat(options.cwd, "/").concat(name);
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, fs_extra_1.default.access(options.cwd, fs_extra_1.default.constants.W_OK)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _b.sent();
                    logger_1.logger.break();
                    logger_1.logger.error("The path ".concat(highlighter_1.highlighter.info(options.cwd), " is not writable."));
                    logger_1.logger.error("It is likely you do not have write permissions for this folder or the path ".concat(highlighter_1.highlighter.info(options.cwd), " does not exist."));
                    logger_1.logger.break();
                    process.exit(1);
                    return [3 /*break*/, 9];
                case 9:
                    if (fs_extra_1.default.existsSync(path_1.default.resolve(options.cwd, name, 'package.json'))) {
                        logger_1.logger.break();
                        logger_1.logger.error("A project with the name ".concat(highlighter_1.highlighter.info(name), " already exists."));
                        logger_1.logger.error("Please choose a different name and try again.");
                        logger_1.logger.break();
                        process.exit(1);
                    }
                    createSpinner = (0, spinner_1.spinner)("Creating a new Next.js project. This may take a few minutes.").start();
                    args = [
                        '--tailwind',
                        '--eslint',
                        '--typescript',
                        '--app',
                        options.srcDir ? '--src-dir' : '--no-src-dir',
                        '--no-import-alias',
                        "--use-".concat(packageManager),
                    ];
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, (0, execa_1.execa)('npx', __spreadArray(['create-next-app@14.2.16', projectPath, '--silent'], args, true), {
                            cwd: options.cwd,
                        })];
                case 11:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 12:
                    error_2 = _b.sent();
                    logger_1.logger.break();
                    logger_1.logger.error("Something went wrong creating a new Next.js project. Please try again.", error_2);
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 13:
                    createSpinner === null || createSpinner === void 0 ? void 0 : createSpinner.succeed('Creating a new Next.js project.');
                    return [2 /*return*/, {
                            projectName: name,
                            projectPath: projectPath,
                        }];
            }
        });
    });
}
