"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registryResolvedItemsTreeSchema = exports.registryBaseColorSchema = exports.stylesSchema = exports.registryIndexSchema = exports.registryItemSchema = exports.registryItemCssVarsSchema = exports.registryItemTailwindSchema = exports.registryItemFileSchema = exports.registryItemTypeSchema = void 0;
var zod_1 = require("zod");
// TODO: Extract this to a shared package.
exports.registryItemTypeSchema = zod_1.z.enum([
    "registry:style",
    "registry:lib",
    "registry:example",
    "registry:block",
    "registry:component",
    "registry:ui",
    "registry:hook",
    "registry:theme",
    "registry:page",
]);
exports.registryItemFileSchema = zod_1.z.object({
    path: zod_1.z.string(),
    content: zod_1.z.string().optional(),
    type: exports.registryItemTypeSchema,
    target: zod_1.z.string().optional(),
});
exports.registryItemTailwindSchema = zod_1.z.object({
    config: zod_1.z
        .object({
        content: zod_1.z.array(zod_1.z.string()).optional(),
        theme: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        plugins: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
exports.registryItemCssVarsSchema = zod_1.z.object({
    light: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    dark: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
exports.registryItemSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: exports.registryItemTypeSchema,
    description: zod_1.z.string().optional(),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
    devDependencies: zod_1.z.array(zod_1.z.string()).optional(),
    registryDependencies: zod_1.z.array(zod_1.z.string()).optional(),
    files: zod_1.z.array(exports.registryItemFileSchema).optional(),
    tailwind: exports.registryItemTailwindSchema.optional(),
    cssVars: exports.registryItemCssVarsSchema.optional(),
    meta: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    docs: zod_1.z.string().optional(),
});
exports.registryIndexSchema = zod_1.z.array(exports.registryItemSchema.extend({
    files: zod_1.z.array(zod_1.z.union([zod_1.z.string(), exports.registryItemFileSchema])).optional(),
}));
exports.stylesSchema = zod_1.z.array(zod_1.z.object({
    name: zod_1.z.string(),
    label: zod_1.z.string(),
}));
exports.registryBaseColorSchema = zod_1.z.object({
    inlineColors: zod_1.z.object({
        light: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
        dark: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    }),
    cssVars: zod_1.z.object({
        light: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
        dark: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    }),
    inlineColorsTemplate: zod_1.z.string(),
    cssVarsTemplate: zod_1.z.string(),
});
exports.registryResolvedItemsTreeSchema = exports.registryItemSchema.pick({
    dependencies: true,
    devDependencies: true,
    files: true,
    tailwind: true,
    cssVars: true,
    docs: true,
});
