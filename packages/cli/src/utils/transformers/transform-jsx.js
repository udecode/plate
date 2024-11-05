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
exports.transformJsx = void 0;
var core_1 = require("@babel/core");
var parser_1 = require("@babel/parser");
// @ts-ignore
var plugin_transform_typescript_1 = __importDefault(require("@babel/plugin-transform-typescript"));
var recast = __importStar(require("recast"));
// TODO.
// I'm using recast for the AST here.
// Figure out if ts-morph AST is compatible with Babel.
// This is a copy of the babel options from recast/parser.
// The goal here is to tolerate as much syntax as possible.
// We want to be able to parse any valid tsx code.
// See https://github.com/benjamn/recast/blob/master/parsers/_babel_options.ts.
var PARSE_OPTIONS = {
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    plugins: [
        'asyncGenerators',
        'bigInt',
        'classPrivateMethods',
        'classPrivateProperties',
        'classProperties',
        'classStaticBlock',
        'decimal',
        'decorators-legacy',
        'doExpressions',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'functionBind',
        'functionSent',
        'importAssertions',
        'importMeta',
        'nullishCoalescingOperator',
        'numericSeparator',
        'objectRestSpread',
        'optionalCatchBinding',
        'optionalChaining',
        [
            'pipelineOperator',
            {
                proposal: 'minimal',
            },
        ],
        [
            'recordAndTuple',
            {
                syntaxType: 'hash',
            },
        ],
        'throwExpressions',
        'topLevelAwait',
        'v8intrinsic',
        'typescript',
        'jsx',
    ],
    sourceType: 'module',
    startLine: 1,
    tokens: true,
};
var transformJsx = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var output, ast, result;
    var config = _b.config, sourceFile = _b.sourceFile;
    return __generator(this, function (_c) {
        output = sourceFile.getFullText();
        if (config.tsx) {
            return [2 /*return*/, output];
        }
        ast = recast.parse(output, {
            parser: {
                parse: function (code) {
                    return (0, parser_1.parse)(code, PARSE_OPTIONS);
                },
            },
        });
        result = (0, core_1.transformFromAstSync)(ast, output, {
            ast: true,
            cloneInputAst: false,
            code: false,
            configFile: false,
            plugins: [plugin_transform_typescript_1.default],
        });
        if (!(result === null || result === void 0 ? void 0 : result.ast)) {
            throw new Error('Failed to transform JSX');
        }
        return [2 /*return*/, recast.print(result.ast).code];
    });
}); };
exports.transformJsx = transformJsx;
