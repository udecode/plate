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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTargetDir = resolveTargetDir;
exports.updateFiles = updateFiles;
var fs_1 = require("fs");
var path_1 = __importStar(require("path"));
var get_project_info_1 = require("@/src/utils/get-project-info");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var registry_1 = require("@/src/utils/registry");
var spinner_1 = require("@/src/utils/spinner");
var transformers_1 = require("@/src/utils/transformers");
var transform_css_vars_1 = require("@/src/utils/transformers/transform-css-vars");
var transform_import_1 = require("@/src/utils/transformers/transform-import");
var transform_rsc_1 = require("@/src/utils/transformers/transform-rsc");
var transform_tw_prefix_1 = require("@/src/utils/transformers/transform-tw-prefix");
var prompts_1 = __importDefault(require("prompts"));
function resolveTargetDir(projectInfo, config, target) {
    if (target.startsWith("~/")) {
        return path_1.default.join(config.resolvedPaths.cwd, target.replace("~/", ""));
    }
    return (projectInfo === null || projectInfo === void 0 ? void 0 : projectInfo.isSrcDir)
        ? path_1.default.join(config.resolvedPaths.cwd, "src", target)
        : path_1.default.join(config.resolvedPaths.cwd, target);
}
function updateFiles(files, config, options) {
    return __awaiter(this, void 0, void 0, function () {
        var filesCreatedSpinner, _a, projectInfo, baseColor, filesCreated, filesUpdated, filesSkipped, _i, files_1, file, targetDir, fileName, filePath, existingFile, overwrite, content, hasUpdatedFiles, _b, filesCreated_1, file, _c, filesUpdated_1, file, _d, filesSkipped_1, file;
        var _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!(files === null || files === void 0 ? void 0 : files.length)) {
                        return [2 /*return*/];
                    }
                    options = __assign({ overwrite: false, force: false, silent: false }, options);
                    filesCreatedSpinner = (_e = (0, spinner_1.spinner)("Updating files.", {
                        silent: options.silent,
                    })) === null || _e === void 0 ? void 0 : _e.start();
                    return [4 /*yield*/, Promise.all([
                            (0, get_project_info_1.getProjectInfo)(config.resolvedPaths.cwd),
                            (0, registry_1.getRegistryBaseColor)(config.tailwind.baseColor),
                        ])];
                case 1:
                    _a = _h.sent(), projectInfo = _a[0], baseColor = _a[1];
                    filesCreated = [];
                    filesUpdated = [];
                    filesSkipped = [];
                    _i = 0, files_1 = files;
                    _h.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 10];
                    file = files_1[_i];
                    if (!file.content) {
                        return [3 /*break*/, 9];
                    }
                    targetDir = (0, registry_1.getRegistryItemFileTargetPath)(file, config);
                    fileName = (0, path_1.basename)(file.path);
                    filePath = path_1.default.join(targetDir, fileName);
                    if (file.target) {
                        filePath = resolveTargetDir(projectInfo, config, file.target);
                        targetDir = path_1.default.dirname(filePath);
                    }
                    if (!config.tsx) {
                        filePath = filePath.replace(/\.tsx?$/, function (match) {
                            return match === ".tsx" ? ".jsx" : ".js";
                        });
                    }
                    existingFile = (0, fs_1.existsSync)(filePath);
                    if (!(existingFile && !options.overwrite)) return [3 /*break*/, 4];
                    filesCreatedSpinner.stop();
                    return [4 /*yield*/, (0, prompts_1.default)({
                            type: "confirm",
                            name: "overwrite",
                            message: "The file ".concat(highlighter_1.highlighter.info(fileName), " already exists. Would you like to overwrite?"),
                            initial: false,
                        })];
                case 3:
                    overwrite = (_h.sent()).overwrite;
                    if (!overwrite) {
                        filesSkipped.push(path_1.default.relative(config.resolvedPaths.cwd, filePath));
                        return [3 /*break*/, 9];
                    }
                    filesCreatedSpinner === null || filesCreatedSpinner === void 0 ? void 0 : filesCreatedSpinner.start();
                    _h.label = 4;
                case 4:
                    if (!!(0, fs_1.existsSync)(targetDir)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fs_1.promises.mkdir(targetDir, { recursive: true })];
                case 5:
                    _h.sent();
                    _h.label = 6;
                case 6: return [4 /*yield*/, (0, transformers_1.transform)({
                        filename: file.path,
                        raw: file.content,
                        config: config,
                        baseColor: baseColor,
                        transformJsx: !config.tsx,
                    }, [transform_import_1.transformImport, transform_rsc_1.transformRsc, transform_css_vars_1.transformCssVars, transform_tw_prefix_1.transformTwPrefixes])];
                case 7:
                    content = _h.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(filePath, content, "utf-8")];
                case 8:
                    _h.sent();
                    existingFile
                        ? filesUpdated.push(path_1.default.relative(config.resolvedPaths.cwd, filePath))
                        : filesCreated.push(path_1.default.relative(config.resolvedPaths.cwd, filePath));
                    _h.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10:
                    hasUpdatedFiles = filesCreated.length || filesUpdated.length;
                    if (!hasUpdatedFiles && !filesSkipped.length) {
                        filesCreatedSpinner === null || filesCreatedSpinner === void 0 ? void 0 : filesCreatedSpinner.info("No files updated.");
                    }
                    if (filesCreated.length) {
                        filesCreatedSpinner === null || filesCreatedSpinner === void 0 ? void 0 : filesCreatedSpinner.succeed("Created ".concat(filesCreated.length, " ").concat(filesCreated.length === 1 ? "file" : "files", ":"));
                        if (!options.silent) {
                            for (_b = 0, filesCreated_1 = filesCreated; _b < filesCreated_1.length; _b++) {
                                file = filesCreated_1[_b];
                                logger_1.logger.log("  - ".concat(file));
                            }
                        }
                    }
                    else {
                        filesCreatedSpinner === null || filesCreatedSpinner === void 0 ? void 0 : filesCreatedSpinner.stop();
                    }
                    if (filesUpdated.length) {
                        (_f = (0, spinner_1.spinner)("Updated ".concat(filesUpdated.length, " ").concat(filesUpdated.length === 1 ? "file" : "files", ":"), {
                            silent: options.silent,
                        })) === null || _f === void 0 ? void 0 : _f.info();
                        if (!options.silent) {
                            for (_c = 0, filesUpdated_1 = filesUpdated; _c < filesUpdated_1.length; _c++) {
                                file = filesUpdated_1[_c];
                                logger_1.logger.log("  - ".concat(file));
                            }
                        }
                    }
                    if (filesSkipped.length) {
                        (_g = (0, spinner_1.spinner)("Skipped ".concat(filesSkipped.length, " ").concat(filesUpdated.length === 1 ? "file" : "files", ":"), {
                            silent: options.silent,
                        })) === null || _g === void 0 ? void 0 : _g.info();
                        if (!options.silent) {
                            for (_d = 0, filesSkipped_1 = filesSkipped; _d < filesSkipped_1.length; _d++) {
                                file = filesSkipped_1[_d];
                                logger_1.logger.log("  - ".concat(file));
                            }
                        }
                    }
                    if (!options.silent) {
                        logger_1.logger.break();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
