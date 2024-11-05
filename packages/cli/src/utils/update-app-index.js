"use strict";
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
exports.updateAppIndex = updateAppIndex;
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var registry_1 = require("@/src/utils/registry");
function updateAppIndex(component, config) {
    return __awaiter(this, void 0, void 0, function () {
        var indexPath, registryItem, content;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    indexPath = path_1.default.join(config.resolvedPaths.cwd, "app/page.tsx");
                    return [4 /*yield*/, promises_1.default.stat(indexPath)];
                case 1:
                    if (!(_e.sent()).isFile()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, registry_1.getRegistryItem)(component, config.style)];
                case 2:
                    registryItem = _e.sent();
                    if (!((_a = registryItem === null || registryItem === void 0 ? void 0 : registryItem.meta) === null || _a === void 0 ? void 0 : _a.importSpecifier) ||
                        !((_b = registryItem === null || registryItem === void 0 ? void 0 : registryItem.meta) === null || _b === void 0 ? void 0 : _b.moduleSpecifier)) {
                        return [2 /*return*/];
                    }
                    content = "import { ".concat((_c = registryItem === null || registryItem === void 0 ? void 0 : registryItem.meta) === null || _c === void 0 ? void 0 : _c.importSpecifier, " } from \"").concat(registryItem.meta.moduleSpecifier, "\"\n\nexport default function Page() {\n  return <").concat((_d = registryItem === null || registryItem === void 0 ? void 0 : registryItem.meta) === null || _d === void 0 ? void 0 : _d.importSpecifier, " />\n}");
                    return [4 /*yield*/, promises_1.default.writeFile(indexPath, content, "utf8")];
                case 3:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
