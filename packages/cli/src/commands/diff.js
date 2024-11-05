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
exports.diff = void 0;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var get_config_1 = require("@/src/utils/get-config");
var handle_error_1 = require("@/src/utils/handle-error");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var registry_1 = require("@/src/utils/registry");
var transformers_1 = require("@/src/utils/transformers");
var commander_1 = require("commander");
var diff_1 = require("diff");
var zod_1 = require("zod");
var updateOptionsSchema = zod_1.z.object({
    component: zod_1.z.string().optional(),
    yes: zod_1.z.boolean(),
    cwd: zod_1.z.string(),
    path: zod_1.z.string().optional(),
    registry: zod_1.z.string().optional(),
});
exports.diff = new commander_1.Command()
    .name("diff")
    .description("check for updates against the registry")
    .argument("[component]", "the component name")
    .option("-y, --yes", "skip confirmation prompt.", false)
    .option("-c, --cwd <cwd>", "the working directory. defaults to the current directory.", process.cwd())
    .option("--registry <url>", "custom registry URL")
    .action(function (name, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var options_1, cwd, config, registryIndex, targetDir_1, projectComponents, componentsWithUpdates, _i, projectComponents_1, component_1, changes_2, _a, componentsWithUpdates_1, component_2, _b, _c, change, component, changes, _d, changes_1, change, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 13, , 14]);
                options_1 = updateOptionsSchema.parse(__assign({ component: name }, opts));
                cwd = path_1.default.resolve(options_1.cwd);
                if (!(0, fs_1.existsSync)(cwd)) {
                    logger_1.logger.error("The path ".concat(cwd, " does not exist. Please try again."));
                    process.exit(1);
                }
                return [4 /*yield*/, (0, get_config_1.getConfig)(cwd)];
            case 1:
                config = _e.sent();
                if (!config) {
                    logger_1.logger.warn("Configuration is missing. Please run ".concat(highlighter_1.highlighter.success("init"), " to create a components.json file."));
                    process.exit(1);
                }
                return [4 /*yield*/, (0, registry_1.getRegistryIndex)(options_1.registry)];
            case 2:
                registryIndex = _e.sent();
                if (!registryIndex) {
                    (0, handle_error_1.handleError)(new Error("Failed to fetch registry index."));
                    process.exit(1);
                }
                if (!!options_1.component) return [3 /*break*/, 7];
                targetDir_1 = config.resolvedPaths.components;
                projectComponents = registryIndex.filter(function (item) {
                    var _a;
                    for (var _i = 0, _b = (_a = item.files) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
                        var file = _b[_i];
                        var filePath = path_1.default.resolve(targetDir_1, typeof file === "string" ? file : file.path);
                        if ((0, fs_1.existsSync)(filePath)) {
                            return true;
                        }
                    }
                    return false;
                });
                componentsWithUpdates = [];
                _i = 0, projectComponents_1 = projectComponents;
                _e.label = 3;
            case 3:
                if (!(_i < projectComponents_1.length)) return [3 /*break*/, 6];
                component_1 = projectComponents_1[_i];
                return [4 /*yield*/, diffComponent(component_1, config)];
            case 4:
                changes_2 = _e.sent();
                if (changes_2.length) {
                    componentsWithUpdates.push({
                        name: component_1.name,
                        changes: changes_2,
                    });
                }
                _e.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                if (!componentsWithUpdates.length) {
                    logger_1.logger.info("No updates found.");
                    process.exit(0);
                }
                logger_1.logger.info("The following components have updates available:");
                for (_a = 0, componentsWithUpdates_1 = componentsWithUpdates; _a < componentsWithUpdates_1.length; _a++) {
                    component_2 = componentsWithUpdates_1[_a];
                    logger_1.logger.info("- ".concat(component_2.name));
                    for (_b = 0, _c = component_2.changes; _b < _c.length; _b++) {
                        change = _c[_b];
                        logger_1.logger.info("  - ".concat(change.filePath));
                    }
                }
                logger_1.logger.break();
                logger_1.logger.info("Run ".concat(highlighter_1.highlighter.success("diff <component>"), " to see the changes."));
                process.exit(0);
                _e.label = 7;
            case 7:
                component = registryIndex.find(function (item) { return item.name === options_1.component; });
                if (!component) {
                    logger_1.logger.error("The component ".concat(highlighter_1.highlighter.success(options_1.component), " does not exist."));
                    process.exit(1);
                }
                return [4 /*yield*/, diffComponent(component, config)];
            case 8:
                changes = _e.sent();
                if (!changes.length) {
                    logger_1.logger.info("No updates found for ".concat(options_1.component, "."));
                    process.exit(0);
                }
                _d = 0, changes_1 = changes;
                _e.label = 9;
            case 9:
                if (!(_d < changes_1.length)) return [3 /*break*/, 12];
                change = changes_1[_d];
                logger_1.logger.info("- ".concat(change.filePath));
                return [4 /*yield*/, printDiff(change.patch)];
            case 10:
                _e.sent();
                logger_1.logger.info("");
                _e.label = 11;
            case 11:
                _d++;
                return [3 /*break*/, 9];
            case 12: return [3 /*break*/, 14];
            case 13:
                error_1 = _e.sent();
                (0, handle_error_1.handleError)(error_1);
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); });
function diffComponent(component, config) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, baseColor, changes, _i, payload_1, item, targetDir, _a, _b, file, filePath, fileContent, registryContent, patch;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, registry_1.fetchTree)(config.style, [component])];
                case 1:
                    payload = _d.sent();
                    return [4 /*yield*/, (0, registry_1.getRegistryBaseColor)(config.tailwind.baseColor)];
                case 2:
                    baseColor = _d.sent();
                    if (!payload) {
                        return [2 /*return*/, []];
                    }
                    changes = [];
                    _i = 0, payload_1 = payload;
                    _d.label = 3;
                case 3:
                    if (!(_i < payload_1.length)) return [3 /*break*/, 10];
                    item = payload_1[_i];
                    return [4 /*yield*/, (0, registry_1.getItemTargetPath)(config, item)];
                case 4:
                    targetDir = _d.sent();
                    if (!targetDir) {
                        return [3 /*break*/, 9];
                    }
                    _a = 0, _b = (_c = item.files) !== null && _c !== void 0 ? _c : [];
                    _d.label = 5;
                case 5:
                    if (!(_a < _b.length)) return [3 /*break*/, 9];
                    file = _b[_a];
                    filePath = path_1.default.resolve(targetDir, typeof file === "string" ? file : file.path);
                    if (!(0, fs_1.existsSync)(filePath)) {
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, fs_1.promises.readFile(filePath, "utf8")];
                case 6:
                    fileContent = _d.sent();
                    if (typeof file === "string" || !file.content) {
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, (0, transformers_1.transform)({
                            filename: file.path,
                            raw: file.content,
                            config: config,
                            baseColor: baseColor,
                        })];
                case 7:
                    registryContent = _d.sent();
                    patch = (0, diff_1.diffLines)(registryContent, fileContent);
                    if (patch.length > 1) {
                        changes.push({
                            filePath: filePath,
                            patch: patch,
                        });
                    }
                    _d.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 5];
                case 9:
                    _i++;
                    return [3 /*break*/, 3];
                case 10: return [2 /*return*/, changes];
            }
        });
    });
}
function printDiff(diff) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            diff.forEach(function (part) {
                if (part) {
                    if (part.added) {
                        return process.stdout.write(highlighter_1.highlighter.success(part.value));
                    }
                    if (part.removed) {
                        return process.stdout.write(highlighter_1.highlighter.error(part.value));
                    }
                    return process.stdout.write(part.value);
                }
            });
            return [2 /*return*/];
        });
    });
}
