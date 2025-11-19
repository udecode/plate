"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
var zod_1 = require("zod");
var logger_1 = require("./logger");
function handleError(error) {
    logger_1.logger.error('Something went wrong. Please check the error below for more details.');
    if (typeof error === 'string') {
        logger_1.logger.error(error);
    }
    else if (error instanceof zod_1.ZodError) {
        logger_1.logger.error('Validation failed:');
        for (var _i = 0, _a = Object.entries(error.flatten().fieldErrors); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            logger_1.logger.error("- ".concat(logger_1.highlighter.info(key), ": ").concat(value.join(', ')));
        }
    }
    else if (error instanceof Error) {
        logger_1.logger.error(error.message);
    }
    logger_1.logger.break();
    process.exit(1);
}
