#!/usr/bin/env node
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
var node_child_process_1 = require("node:child_process");
var promises_1 = __importDefault(require("node:fs/promises"));
var node_path_1 = __importDefault(require("node:path"));
var node_util_1 = require("node:util");
var commander_1 = require("commander");
var prompts_1 = __importDefault(require("prompts"));
var zod_1 = require("zod");
var package_json_1 = __importDefault(require("../package.json"));
var get_package_manager_1 = require("./utils/get-package-manager");
var handle_error_1 = require("./utils/handle-error");
var logger_1 = require("./utils/logger");
var spinner_1 = require("./utils/spinner");
process.on('SIGINT', function () { return process.exit(0); });
process.on('SIGTERM', function () { return process.exit(0); });
var execPromise = (0, node_util_1.promisify)(node_child_process_1.exec);
var VERSION_PREFIX_REGEX = /^\D*/;
var DepSyncOptionsSchema = zod_1.z.object({
    packageSpecifier: zod_1.z.string().min(1, 'Package specifier is required.'),
    targetVersion: zod_1.z.string().optional(),
    install: zod_1.z.boolean().default(false),
    yes: zod_1.z.boolean().default(false),
    cwd: zod_1.z.string().default(process.cwd()),
    silent: zod_1.z.boolean().default(false), // Added for global silent control
    latest: zod_1.z.boolean().optional(), // Added for --latest flag
});
function getPackageJson(cwd, options) {
    return __awaiter(this, void 0, void 0, function () {
        var targetPath, sp, fileContent, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    targetPath = node_path_1.default.join(cwd, './package.json');
                    sp = (_a = (0, spinner_1.spinner)("Reading package.json from ".concat(targetPath), {
                        silent: options.silent,
                    })) === null || _a === void 0 ? void 0 : _a.start();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, promises_1.default.readFile(targetPath, 'utf8')];
                case 2:
                    fileContent = _b.sent();
                    sp === null || sp === void 0 ? void 0 : sp.succeed('Successfully read package.json');
                    return [2 /*return*/, JSON.parse(fileContent)];
                case 3:
                    error_1 = _b.sent();
                    sp === null || sp === void 0 ? void 0 : sp.fail("Error reading package.json at ".concat(targetPath));
                    (0, handle_error_1.handleError)(error_1); // handleError will exit
                    return [2 /*return*/, null]; // Should not be reached
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchPackageVersion(pkg, targetVersionString) {
    return __awaiter(this, void 0, void 0, function () {
        var versionSpecifier, stdout, versions, latestMatchingVersion, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    versionSpecifier = targetVersionString
                        ? "".concat(pkg, "@\"<=").concat(targetVersionString, "\"")
                        : pkg;
                    return [4 /*yield*/, execPromise("npm view ".concat(versionSpecifier, " version --json"))];
                case 1:
                    stdout = (_a.sent()).stdout;
                    versions = JSON.parse(stdout);
                    latestMatchingVersion = Array.isArray(versions)
                        ? versions.at(-1)
                        : versions;
                    if (latestMatchingVersion) {
                        return [2 /*return*/, latestMatchingVersion.trim()];
                    }
                    return [2 /*return*/, null];
                case 2:
                    error_2 = _a.sent();
                    logger_1.logger.error(error_2.message);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchPackageVersions(packagesToFetch, currentPackageJson, options) {
    return __awaiter(this, void 0, void 0, function () {
        var specifierDisplay, fetchingMessage, sp, versionPromises, results, versionMap;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    specifierDisplay = options.packageSpecifier
                        ? " matching \"".concat(options.packageSpecifier, "\"")
                        : '';
                    fetchingMessage = options.targetVersion
                        ? "Fetching latest package versions".concat(specifierDisplay, " (up to ").concat(options.targetVersion, ")")
                        : "Fetching latest package versions".concat(specifierDisplay);
                    logger_1.logger.info(fetchingMessage);
                    sp = (_a = (0, spinner_1.spinner)('Fetching package versions in parallel...', {
                        silent: options.silent,
                    })) === null || _a === void 0 ? void 0 : _a.start();
                    versionPromises = packagesToFetch.map(function (pkg) { return __awaiter(_this, void 0, void 0, function () {
                        var version, currentVersion;
                        var _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0: return [4 /*yield*/, fetchPackageVersion(pkg, options.targetVersion)];
                                case 1:
                                    version = _e.sent();
                                    if (version) {
                                        currentVersion = ((_b = (_a = currentPackageJson.dependencies) === null || _a === void 0 ? void 0 : _a[pkg]) === null || _b === void 0 ? void 0 : _b.replace(VERSION_PREFIX_REGEX, '')) ||
                                            ((_d = (_c = currentPackageJson.devDependencies) === null || _c === void 0 ? void 0 : _c[pkg]) === null || _d === void 0 ? void 0 : _d.replace(VERSION_PREFIX_REGEX, '')) ||
                                            'Not installed';
                                        return [2 /*return*/, [pkg, { currentVersion: currentVersion, version: version }]];
                                    }
                                    return [2 /*return*/, null];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(versionPromises)];
                case 1:
                    results = _b.sent();
                    versionMap = new Map(results.filter(Boolean));
                    sp === null || sp === void 0 ? void 0 : sp.succeed('Finished fetching package versions.');
                    return [2 /*return*/, versionMap];
            }
        });
    });
}
function preparePackageUpdates(currentPackageJson, versionMap) {
    return __awaiter(this, void 0, void 0, function () {
        var updatedPackages, newPackageJson, _i, _a, _b, name_1, versions, changed;
        var _c, _d;
        return __generator(this, function (_e) {
            updatedPackages = [];
            newPackageJson = JSON.parse(JSON.stringify(currentPackageJson));
            for (_i = 0, _a = Array.from(versionMap.entries()); _i < _a.length; _i++) {
                _b = _a[_i], name_1 = _b[0], versions = _b[1];
                changed = false;
                if (((_c = newPackageJson.dependencies) === null || _c === void 0 ? void 0 : _c[name_1]) &&
                    newPackageJson.dependencies[name_1].replace(VERSION_PREFIX_REGEX, '') !==
                        versions.version) {
                    newPackageJson.dependencies[name_1] = versions.version; // Or keep prefix if present: `^${versions.version}`
                    changed = true;
                }
                if (((_d = newPackageJson.devDependencies) === null || _d === void 0 ? void 0 : _d[name_1]) &&
                    newPackageJson.devDependencies[name_1].replace(VERSION_PREFIX_REGEX, '') !==
                        versions.version) {
                    newPackageJson.devDependencies[name_1] = versions.version;
                    changed = true;
                }
                if (changed) {
                    updatedPackages.push({
                        name: name_1,
                        currentVersion: versions.currentVersion,
                        newVersion: versions.version,
                    });
                }
            }
            return [2 /*return*/, {
                    updatedPackages: updatedPackages,
                    newPackageJsonString: JSON.stringify(newPackageJson, null, 2),
                }];
        });
    });
}
function runSync(options) {
    return __awaiter(this, void 0, void 0, function () {
        var mainSpinner, packageFilterFn, matchDescription, prefix_1, scopeAsExact_1, scopeAsPrefix_1, currentPackageJson, allDependencies, packagesToFetch, versionMap, _a, updatedPackages, newPackageJsonString, proceed, confirmUpdate, writeSpinner, error_3, shouldRunInstall, confirmInstall, pm, installCommand, installSpinner;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    mainSpinner = (_b = (0, spinner_1.spinner)('Starting dependency synchronization...', {
                        silent: options.silent,
                    })) === null || _b === void 0 ? void 0 : _b.start();
                    if (options.packageSpecifier.endsWith('*')) {
                        prefix_1 = options.packageSpecifier.slice(0, -1);
                        packageFilterFn = function (pkgName) { return pkgName.startsWith(prefix_1); };
                        matchDescription = "packages starting with \"".concat(prefix_1, "\"");
                    }
                    else if (options.packageSpecifier.startsWith('@') &&
                        !options.packageSpecifier.includes('/')) {
                        scopeAsExact_1 = options.packageSpecifier;
                        scopeAsPrefix_1 = "".concat(options.packageSpecifier, "/");
                        packageFilterFn = function (pkgName) {
                            return pkgName.startsWith(scopeAsPrefix_1) || pkgName === scopeAsExact_1;
                        };
                        matchDescription = "packages in scope \"".concat(options.packageSpecifier, "\"");
                    }
                    else {
                        packageFilterFn = function (pkgName) { return pkgName === options.packageSpecifier; };
                        matchDescription = "package \"".concat(options.packageSpecifier, "\"");
                    }
                    logger_1.logger.info("\nSynchronizing ".concat(matchDescription));
                    if (options.targetVersion) {
                        logger_1.logger.info("Targeting version: ".concat(options.targetVersion));
                    }
                    logger_1.logger.info("Working directory: ".concat(options.cwd));
                    if (!options.yes) {
                        mainSpinner.stop();
                        mainSpinner.clear();
                        mainSpinner = (_c = (0, spinner_1.spinner)('Processing packages...', {
                            silent: options.silent,
                        })) === null || _c === void 0 ? void 0 : _c.start();
                    }
                    return [4 /*yield*/, getPackageJson(options.cwd, options)];
                case 1:
                    currentPackageJson = _f.sent();
                    if (!currentPackageJson)
                        return [2 /*return*/]; // Error handled in getPackageJson
                    allDependencies = __assign(__assign({}, (currentPackageJson.dependencies || {})), (currentPackageJson.devDependencies || {}));
                    packagesToFetch = Object.keys(allDependencies).filter(packageFilterFn);
                    if (packagesToFetch.length === 0) {
                        mainSpinner.warn("No packages found in dependencies for ".concat(matchDescription, "."));
                        if (options.packageSpecifier &&
                            !options.packageSpecifier.endsWith('*') &&
                            !options.packageSpecifier.includes('/')) {
                            logger_1.logger.info("Did you mean '".concat(options.packageSpecifier, "/*' or an exact package name like '").concat(options.packageSpecifier, "/some-package'?"));
                        }
                        return [2 /*return*/];
                    }
                    logger_1.logger.info("Found ".concat(packagesToFetch.length, " package").concat(packagesToFetch.length === 1 ? '' : 's', " to check: ").concat(packagesToFetch.join(', ')));
                    return [4 /*yield*/, fetchPackageVersions(packagesToFetch, currentPackageJson, options)];
                case 2:
                    versionMap = _f.sent();
                    if (versionMap.size === 0 && packagesToFetch.length > 0) {
                        mainSpinner.warn('Could not fetch versions for any of the targeted packages.');
                        return [2 /*return*/];
                    }
                    if (versionMap.size === 0 && packagesToFetch.length === 0) {
                        // This case is already handled by the packagesToFetch.length === 0 check above, but good for clarity
                        mainSpinner.info('No packages matched the specifier.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, preparePackageUpdates(currentPackageJson, versionMap)];
                case 3:
                    _a = _f.sent(), updatedPackages = _a.updatedPackages, newPackageJsonString = _a.newPackageJsonString;
                    mainSpinner.succeed('Package analysis complete.');
                    if (!(updatedPackages.length > 0)) return [3 /*break*/, 19];
                    logger_1.logger.info('The following packages will be updated:');
                    updatedPackages.forEach(function (_a) {
                        var name = _a.name, currentVersion = _a.currentVersion, newVersion = _a.newVersion;
                        logger_1.logger.log("  ".concat(name, ": ").concat(currentVersion, " -> ").concat(newVersion));
                    });
                    logger_1.logger.break();
                    proceed = options.yes;
                    if (!!options.yes) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, prompts_1.default)({
                            type: 'confirm',
                            name: 'confirmUpdate',
                            message: 'Apply these changes to package.json?',
                            initial: true,
                        })];
                case 4:
                    confirmUpdate = (_f.sent()).confirmUpdate;
                    proceed = confirmUpdate;
                    _f.label = 5;
                case 5:
                    if (!proceed) return [3 /*break*/, 17];
                    writeSpinner = (_d = (0, spinner_1.spinner)('Updating package.json...', {
                        silent: options.silent,
                    })) === null || _d === void 0 ? void 0 : _d.start();
                    _f.label = 6;
                case 6:
                    _f.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, promises_1.default.writeFile(node_path_1.default.join(options.cwd, './package.json'), newPackageJsonString)];
                case 7:
                    _f.sent();
                    writeSpinner === null || writeSpinner === void 0 ? void 0 : writeSpinner.succeed('package.json updated successfully.');
                    return [3 /*break*/, 9];
                case 8:
                    error_3 = _f.sent();
                    writeSpinner === null || writeSpinner === void 0 ? void 0 : writeSpinner.fail('Error writing to package.json.');
                    (0, handle_error_1.handleError)(error_3);
                    return [2 /*return*/];
                case 9:
                    shouldRunInstall = false;
                    if (!options.install) return [3 /*break*/, 10];
                    // --install flag IS present
                    shouldRunInstall = true;
                    return [3 /*break*/, 13];
                case 10:
                    if (!options.yes) return [3 /*break*/, 11];
                    // --install flag IS NOT present, but --yes IS present
                    shouldRunInstall = true;
                    return [3 /*break*/, 13];
                case 11: return [4 /*yield*/, (0, prompts_1.default)({
                        type: 'confirm',
                        name: 'confirmInstall',
                        message: 'Run package manager install command to apply these changes?',
                        initial: true,
                    })];
                case 12:
                    confirmInstall = (_f.sent()).confirmInstall;
                    shouldRunInstall = confirmInstall;
                    _f.label = 13;
                case 13:
                    if (!shouldRunInstall) return [3 /*break*/, 15];
                    return [4 /*yield*/, (0, get_package_manager_1.getPackageManager)(options.cwd)];
                case 14:
                    pm = _f.sent();
                    installCommand = "".concat(pm, " install");
                    installSpinner = (_e = (0, spinner_1.spinner)("Running `".concat(installCommand, "`..."), { silent: options.silent })) === null || _e === void 0 ? void 0 : _e.start();
                    try {
                        (0, node_child_process_1.execSync)(installCommand, {
                            cwd: options.cwd,
                            stdio: options.silent ? 'pipe' : 'inherit',
                        });
                        installSpinner === null || installSpinner === void 0 ? void 0 : installSpinner.succeed("Successfully ran `".concat(installCommand, "`"));
                    }
                    catch (error) {
                        installSpinner === null || installSpinner === void 0 ? void 0 : installSpinner.fail("Error running `".concat(installCommand, "`"));
                        (0, handle_error_1.handleError)(error); // Will exit
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 16];
                case 15:
                    if (updatedPackages.length > 0 &&
                        !options.install &&
                        options.yes) {
                        logger_1.logger.info('Skipping package installation as --install was not provided with --yes.');
                    }
                    else if (updatedPackages.length > 0 && !shouldRunInstall) {
                        logger_1.logger.info('Skipping package installation.');
                    }
                    _f.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    logger_1.logger.info('Changes to package.json were not applied by user.');
                    _f.label = 18;
                case 18: return [3 /*break*/, 20];
                case 19:
                    logger_1.logger.success('All specified packages are already up to date.');
                    _f.label = 20;
                case 20:
                    logger_1.logger.break();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var program;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    program = new commander_1.Command();
                    program
                        .name('depset')
                        .description('Synchronize package dependencies to their latest or a specific version.')
                        .version(package_json_1.default.version || '0.1.0', '-v, --version', 'display the version number')
                        .argument('[package-specifier]', 'Package name or pattern (e.g., "@scope/foo*", "my-package", "@myorg")')
                        .argument('[target-version]', 'Target version (e.g., "1.2.3") - defaults to latest if omitted')
                        .option('-i, --install', 'Automatically run install after updating package.json', false)
                        .option('-y, --yes', 'Skip all confirmation prompts', false)
                        .option('-c, --cwd <path>', 'Set the current working directory', process.cwd())
                        .option('-s, --silent', 'Silence all output except for errors', false)
                        .option('-L, --latest', 'Use the latest version, skip version prompt', false) // Added --latest option
                        .action(function (packageSpecifierArg, targetVersionArg, cliOpts) { return __awaiter(_this, void 0, void 0, function () {
                        var pkgSpec, targetVer, response, versionResponse, rawOptions, options, error_4, originalLogger;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 8, , 9]);
                                    pkgSpec = packageSpecifierArg;
                                    targetVer = targetVersionArg;
                                    if (!(!pkgSpec && !cliOpts.yes)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, prompts_1.default)({
                                            type: 'text',
                                            name: 'packageSpecifier',
                                            message: 'Enter the package name or pattern to synchronize:',
                                            validate: function (value) {
                                                return value && value.trim().length > 0
                                                    ? true
                                                    : 'Package specifier cannot be empty.';
                                            },
                                        })];
                                case 1:
                                    response = _a.sent();
                                    if (!response.packageSpecifier) {
                                        logger_1.logger.warn('Package specifier is required. Exiting.');
                                        return [2 /*return*/];
                                    }
                                    pkgSpec = response.packageSpecifier;
                                    return [3 /*break*/, 3];
                                case 2:
                                    if (!pkgSpec && cliOpts.yes) {
                                        logger_1.logger.error('Error: package-specifier is required.');
                                        process.exit(1);
                                    }
                                    _a.label = 3;
                                case 3:
                                    if (!(!targetVer && !cliOpts.yes && !cliOpts.latest)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, prompts_1.default)({
                                            type: 'text',
                                            name: 'targetVersion',
                                            message: 'Enter the target version (e.g., "1.2.3", or leave blank for latest):',
                                        })];
                                case 4:
                                    versionResponse = _a.sent();
                                    targetVer = versionResponse.targetVersion || undefined;
                                    return [3 /*break*/, 6];
                                case 5:
                                    if (cliOpts.latest) {
                                        targetVer = undefined; // Ensure targetVer is undefined if --latest is used
                                    }
                                    _a.label = 6;
                                case 6:
                                    rawOptions = {
                                        packageSpecifier: pkgSpec,
                                        targetVersion: targetVer,
                                        install: cliOpts.install,
                                        yes: cliOpts.yes,
                                        cwd: cliOpts.cwd,
                                        silent: cliOpts.silent,
                                        latest: cliOpts.latest, // Added latest to rawOptions
                                    };
                                    options = DepSyncOptionsSchema.parse(rawOptions);
                                    if (options.silent) {
                                        // Suppress non-error console logs if silent is true
                                        logger_1.logger.info = function () { };
                                        logger_1.logger.success = function () { };
                                        logger_1.logger.warn = function () { };
                                        logger_1.logger.log = function () { };
                                        logger_1.logger.break = function () { };
                                    }
                                    return [4 /*yield*/, runSync(options)];
                                case 7:
                                    _a.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    error_4 = _a.sent();
                                    originalLogger = __assign({}, logger_1.logger);
                                    if (cliOpts.silent) {
                                        logger_1.logger.error = console.error; // Fallback for errors
                                        logger_1.logger.break = function () { return console.log(''); };
                                    }
                                    (0, handle_error_1.handleError)(error_4);
                                    // Restore logger if it was modified
                                    if (cliOpts.silent) {
                                        Object.assign(logger_1.logger, originalLogger);
                                    }
                                    return [3 /*break*/, 9];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, program.parseAsync(process.argv)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
