"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDifferent = isDifferent;
exports.getDifferences = getDifferences;
function isDifferent(newValue, defaultValue) {
    if (typeof newValue === "object" && newValue !== null) {
        if (typeof defaultValue !== "object" || defaultValue === null) {
            return true;
        }
        for (var key in newValue) {
            if (isDifferent(newValue[key], defaultValue[key])) {
                return true;
            }
        }
        for (var key in defaultValue) {
            if (!(key in newValue)) {
                return true;
            }
        }
        return false;
    }
    return newValue !== defaultValue;
}
function getDifferences(newConfig, defaultConfig) {
    var differences = {};
    for (var key in newConfig) {
        if (isDifferent(newConfig[key], defaultConfig[key])) {
            if (typeof newConfig[key] === "object" && newConfig[key] !== null) {
                differences[key] = getDifferences(newConfig[key], defaultConfig[key] || {});
                if (Object.keys(differences[key]).length === 0) {
                    delete differences[key];
                }
            }
            else {
                differences[key] = newConfig[key];
            }
        }
    }
    return differences;
}
