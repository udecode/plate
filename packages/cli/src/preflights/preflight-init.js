"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preFlightInit = preFlightInit;
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var ERRORS = __importStar(require("@/src/utils/errors"));
var get_project_info_1 = require("@/src/utils/get-project-info");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var spinner_1 = require("@/src/utils/spinner");
function preFlightInit(options) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, projectSpinner, frameworkSpinner, projectInfo, tailwindSpinner, tsConfigSpinner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errors = {};
                    // Ensure target directory exists.
                    // Check for empty project. We assume if no package.json exists, the project is empty.
                    if (!fs_extra_1.default.existsSync(options.cwd) ||
                        !fs_extra_1.default.existsSync(path_1.default.resolve(options.cwd, 'package.json'))) {
                        errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true;
                        return [2 /*return*/, {
                                errors: errors,
                                projectInfo: null,
                            }];
                    }
                    projectSpinner = (0, spinner_1.spinner)("Preflight checks.", {
                        silent: options.silent,
                    }).start();
                    if (fs_extra_1.default.existsSync(path_1.default.resolve(options.cwd, 'components.json')) &&
                        !options.force &&
                        !options.url) {
                        projectSpinner === null || projectSpinner === void 0 ? void 0 : projectSpinner.fail();
                        logger_1.logger.break();
                        logger_1.logger.error("A ".concat(highlighter_1.highlighter.info('components.json'), " file already exists at ").concat(highlighter_1.highlighter.info(options.cwd), ".\nTo start over, remove the ").concat(highlighter_1.highlighter.info('components.json'), " file and run ").concat(highlighter_1.highlighter.info('init'), " again."));
                        logger_1.logger.break();
                        process.exit(1);
                    }
                    projectSpinner === null || projectSpinner === void 0 ? void 0 : projectSpinner.succeed();
                    frameworkSpinner = (0, spinner_1.spinner)("Verifying framework.", {
                        silent: options.silent,
                    }).start();
                    return [4 /*yield*/, (0, get_project_info_1.getProjectInfo)(options.cwd)];
                case 1:
                    projectInfo = _a.sent();
                    if (!projectInfo || (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.name) === 'manual') {
                        errors[ERRORS.UNSUPPORTED_FRAMEWORK] = true;
                        frameworkSpinner === null || frameworkSpinner === void 0 ? void 0 : frameworkSpinner.fail();
                        logger_1.logger.break();
                        if (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.links.installation) {
                            logger_1.logger.error("We could not detect a supported framework at ".concat(highlighter_1.highlighter.info(options.cwd), ".\n") +
                                "Visit ".concat(highlighter_1.highlighter.info(projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.links.installation), " to manually configure your project.\nOnce configured, you can use the cli to add components."));
                        }
                        logger_1.logger.break();
                        process.exit(1);
                    }
                    frameworkSpinner === null || frameworkSpinner === void 0 ? void 0 : frameworkSpinner.succeed("Verifying framework. Found ".concat(highlighter_1.highlighter.info(projectInfo.framework.label), "."));
                    tailwindSpinner = (0, spinner_1.spinner)("Validating Tailwind CSS.", {
                        silent: options.silent,
                    }).start();
                    if (!(projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.tailwindConfigFile) || !(projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.tailwindCssFile)) {
                        errors[ERRORS.TAILWIND_NOT_CONFIGURED] = true;
                        tailwindSpinner === null || tailwindSpinner === void 0 ? void 0 : tailwindSpinner.fail();
                    }
                    else {
                        tailwindSpinner === null || tailwindSpinner === void 0 ? void 0 : tailwindSpinner.succeed();
                    }
                    tsConfigSpinner = (0, spinner_1.spinner)("Validating import alias.", {
                        silent: options.silent,
                    }).start();
                    if (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.aliasPrefix) {
                        tsConfigSpinner === null || tsConfigSpinner === void 0 ? void 0 : tsConfigSpinner.succeed();
                    }
                    else {
                        errors[ERRORS.IMPORT_ALIAS_MISSING] = true;
                        tsConfigSpinner === null || tsConfigSpinner === void 0 ? void 0 : tsConfigSpinner.fail();
                    }
                    if (Object.keys(errors).length > 0) {
                        if (errors[ERRORS.TAILWIND_NOT_CONFIGURED]) {
                            logger_1.logger.break();
                            logger_1.logger.error("No Tailwind CSS configuration found at ".concat(highlighter_1.highlighter.info(options.cwd), "."));
                            logger_1.logger.error("It is likely you do not have Tailwind CSS installed or have an invalid configuration.");
                            logger_1.logger.error("Install Tailwind CSS then try again.");
                            if (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.links.tailwind) {
                                logger_1.logger.error("Visit ".concat(highlighter_1.highlighter.info(projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.links.tailwind), " to get started."));
                            }
                        }
                        if (errors[ERRORS.IMPORT_ALIAS_MISSING]) {
                            logger_1.logger.break();
                            logger_1.logger.error("No import alias found in your tsconfig.json file.");
                            if (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.links.installation) {
                                logger_1.logger.error("Visit ".concat(highlighter_1.highlighter.info(projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.framework.links.installation), " to learn how to set an import alias."));
                            }
                        }
                        logger_1.logger.break();
                        process.exit(1);
                    }
                    return [2 /*return*/, {
                            errors: errors,
                            projectInfo: projectInfo,
                        }];
            }
        });
    });
}
