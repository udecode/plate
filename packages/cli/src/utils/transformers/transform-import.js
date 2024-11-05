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
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformImport = void 0;
var transformImport = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var importDeclarations, _i, importDeclarations_1, importDeclaration, moduleSpecifier, namedImports, cnImport;
    var config = _b.config, sourceFile = _b.sourceFile;
    return __generator(this, function (_c) {
        importDeclarations = sourceFile.getImportDeclarations();
        for (_i = 0, importDeclarations_1 = importDeclarations; _i < importDeclarations_1.length; _i++) {
            importDeclaration = importDeclarations_1[_i];
            moduleSpecifier = updateImportAliases(importDeclaration.getModuleSpecifierValue(), config);
            importDeclaration.setModuleSpecifier(moduleSpecifier);
            // Replace `import { cn } from "@/lib/utils"`
            if (moduleSpecifier == '@/lib/utils') {
                namedImports = importDeclaration.getNamedImports();
                cnImport = namedImports.find(function (i) { return i.getName() === 'cn'; });
                if (cnImport) {
                    importDeclaration.setModuleSpecifier(moduleSpecifier.replace(/^@\/lib\/utils/, config.aliases.utils));
                }
            }
        }
        return [2 /*return*/, sourceFile];
    });
}); };
exports.transformImport = transformImport;
function updateImportAliases(moduleSpecifier, config) {
    var _a;
    // Not a local import.
    if (!moduleSpecifier.startsWith('@/')) {
        return moduleSpecifier;
    }
    // Not a registry import.
    if (!moduleSpecifier.startsWith('@/registry/')) {
        // We fix the alias an return.
        var alias = config.aliases.components.charAt(0);
        return moduleSpecifier.replace(/^@\//, "".concat(alias, "/"));
    }
    if (/^@\/registry\/(.+)\/ui/.exec(moduleSpecifier)) {
        return moduleSpecifier.replace(/^@\/registry\/(.+)\/ui/, (_a = config.aliases.ui) !== null && _a !== void 0 ? _a : "".concat(config.aliases.components, "/ui"));
    }
    if (config.aliases.components &&
        /^@\/registry\/(.+)\/components/.exec(moduleSpecifier)) {
        return moduleSpecifier.replace(/^@\/registry\/(.+)\/components/, config.aliases.components);
    }
    if (config.aliases.lib && /^@\/registry\/(.+)\/lib/.exec(moduleSpecifier)) {
        return moduleSpecifier.replace(/^@\/registry\/(.+)\/lib/, config.aliases.lib);
    }
    if (config.aliases.hooks &&
        /^@\/registry\/(.+)\/hooks/.exec(moduleSpecifier)) {
        return moduleSpecifier.replace(/^@\/registry\/(.+)\/hooks/, config.aliases.hooks);
    }
    return moduleSpecifier.replace(/^@\/registry\/[^/]+/, config.aliases.components);
}
