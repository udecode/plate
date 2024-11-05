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
exports.preFlightAdd = preFlightAdd;
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var ERRORS = __importStar(require("@/src/utils/errors"));
var get_config_1 = require("@/src/utils/get-config");
var highlighter_1 = require("@/src/utils/highlighter");
var logger_1 = require("@/src/utils/logger");
var registry_1 = require("@/src/utils/registry");
function preFlightAdd(options) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, configPath, config, registryUrl_1, hasRegistry, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    errors = {};
                    // Ensure target directory exists.
                    // Check for empty project. We assume if no package.json exists, the project is empty.
                    if (!fs_extra_1.default.existsSync(options.cwd) ||
                        !fs_extra_1.default.existsSync(path_1.default.resolve(options.cwd, 'package.json'))) {
                        errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true;
                        return [2 /*return*/, {
                                config: null,
                                errors: errors,
                            }];
                    }
                    configPath = path_1.default.resolve(options.cwd, 'components.json');
                    if (!fs_extra_1.default.existsSync(configPath)) {
                        errors[ERRORS.MISSING_CONFIG] = true;
                        return [2 /*return*/, {
                                config: null,
                                errors: errors,
                            }];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, get_config_1.getConfig)(options.cwd)];
                case 2:
                    config = _b.sent();
                    if (!config) {
                        errors[ERRORS.MISSING_CONFIG] = true;
                        return [2 /*return*/, { config: null, errors: errors }];
                    }
                    // Check if the required registry exists in config
                    if (options.registry) {
                        registryUrl_1 = registry_1.REGISTRY_MAP[options.registry];
                        hasRegistry = ((_a = config.registries) === null || _a === void 0 ? void 0 : _a[options.registry]) ||
                            Object.values(config.registries || {}).some(function (reg) { return reg.url === registryUrl_1; });
                        if (!hasRegistry) {
                            errors[ERRORS.MISSING_REGISTRY] = true;
                            return [2 /*return*/, { config: config, errors: errors }];
                        }
                    }
                    return [2 /*return*/, {
                            config: config,
                            errors: errors,
                        }];
                case 3:
                    error_1 = _b.sent();
                    logger_1.logger.break();
                    logger_1.logger.error("An invalid ".concat(highlighter_1.highlighter.info('components.json'), " file was found at ").concat(highlighter_1.highlighter.info(options.cwd), ".\nBefore you can add components, you must create a valid ").concat(highlighter_1.highlighter.info('components.json'), " file by running the ").concat(highlighter_1.highlighter.info('init'), " command."));
                    logger_1.logger.error("Learn more at ".concat(highlighter_1.highlighter.info('https://ui.shadcn.com/docs/components-json'), "."));
                    logger_1.logger.break();
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
