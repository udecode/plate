"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageInfo = getPackageInfo;
var path_1 = __importDefault(require("path"));
var fs_extra_1 = __importDefault(require("fs-extra"));
function getPackageInfo(cwd, shouldThrow) {
    if (cwd === void 0) { cwd = ""; }
    if (shouldThrow === void 0) { shouldThrow = true; }
    var packageJsonPath = path_1.default.join(cwd, "package.json");
    return fs_extra_1.default.readJSONSync(packageJsonPath, {
        throws: shouldThrow,
    });
}
