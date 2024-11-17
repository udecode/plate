import { z } from "zod";
export declare const registryItemTypeSchema: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
export declare const registryItemFileSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
    target: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
    content?: string | undefined;
    target?: string | undefined;
}, {
    path: string;
    type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
    content?: string | undefined;
    target?: string | undefined;
}>;
export declare const registryItemTailwindSchema: z.ZodObject<{
    config: z.ZodOptional<z.ZodObject<{
        content: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        plugins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        content?: string[] | undefined;
        theme?: Record<string, any> | undefined;
        plugins?: string[] | undefined;
    }, {
        content?: string[] | undefined;
        theme?: Record<string, any> | undefined;
        plugins?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    config?: {
        content?: string[] | undefined;
        theme?: Record<string, any> | undefined;
        plugins?: string[] | undefined;
    } | undefined;
}, {
    config?: {
        content?: string[] | undefined;
        theme?: Record<string, any> | undefined;
        plugins?: string[] | undefined;
    } | undefined;
}>;
export declare const registryItemCssVarsSchema: z.ZodObject<{
    light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    light?: Record<string, string> | undefined;
    dark?: Record<string, string> | undefined;
}, {
    light?: Record<string, string> | undefined;
    dark?: Record<string, string> | undefined;
}>;
export declare const registryItemSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
        target: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }>, "many">>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        }, {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    }, {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    }>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    }, {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
    name: string;
    tailwind?: {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    } | undefined;
    description?: string | undefined;
    dependencies?: string[] | undefined;
    devDependencies?: string[] | undefined;
    registryDependencies?: string[] | undefined;
    files?: {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }[] | undefined;
    cssVars?: {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
    meta?: Record<string, any> | undefined;
    docs?: string | undefined;
}, {
    type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
    name: string;
    tailwind?: {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    } | undefined;
    description?: string | undefined;
    dependencies?: string[] | undefined;
    devDependencies?: string[] | undefined;
    registryDependencies?: string[] | undefined;
    files?: {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }[] | undefined;
    cssVars?: {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
    meta?: Record<string, any> | undefined;
    docs?: string | undefined;
}>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export declare const registryIndexSchema: z.ZodArray<z.ZodObject<z.objectUtil.extendShape<{
    name: z.ZodString;
    type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
        target: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }>, "many">>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        }, {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    }, {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    }>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    }, {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
}, {
    files: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
        target: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }>]>, "many">>;
}>, "strip", z.ZodTypeAny, {
    type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
    name: string;
    tailwind?: {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    } | undefined;
    description?: string | undefined;
    dependencies?: string[] | undefined;
    devDependencies?: string[] | undefined;
    registryDependencies?: string[] | undefined;
    files?: (string | {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    })[] | undefined;
    cssVars?: {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
    meta?: Record<string, any> | undefined;
    docs?: string | undefined;
}, {
    type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
    name: string;
    tailwind?: {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    } | undefined;
    description?: string | undefined;
    dependencies?: string[] | undefined;
    devDependencies?: string[] | undefined;
    registryDependencies?: string[] | undefined;
    files?: (string | {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    })[] | undefined;
    cssVars?: {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
    meta?: Record<string, any> | undefined;
    docs?: string | undefined;
}>, "many">;
export declare const stylesSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    label: string;
}, {
    name: string;
    label: string;
}>, "many">;
export declare const registryBaseColorSchema: z.ZodObject<{
    inlineColors: z.ZodObject<{
        light: z.ZodRecord<z.ZodString, z.ZodString>;
        dark: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        light: Record<string, string>;
        dark: Record<string, string>;
    }, {
        light: Record<string, string>;
        dark: Record<string, string>;
    }>;
    cssVars: z.ZodObject<{
        light: z.ZodRecord<z.ZodString, z.ZodString>;
        dark: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        light: Record<string, string>;
        dark: Record<string, string>;
    }, {
        light: Record<string, string>;
        dark: Record<string, string>;
    }>;
    inlineColorsTemplate: z.ZodString;
    cssVarsTemplate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cssVars: {
        light: Record<string, string>;
        dark: Record<string, string>;
    };
    inlineColors: {
        light: Record<string, string>;
        dark: Record<string, string>;
    };
    inlineColorsTemplate: string;
    cssVarsTemplate: string;
}, {
    cssVars: {
        light: Record<string, string>;
        dark: Record<string, string>;
    };
    inlineColors: {
        light: Record<string, string>;
        dark: Record<string, string>;
    };
    inlineColorsTemplate: string;
    cssVarsTemplate: string;
}>;
export declare const registryResolvedItemsTreeSchema: z.ZodObject<Pick<{
    name: z.ZodString;
    type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    devDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    registryDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["registry:style", "registry:lib", "registry:example", "registry:block", "registry:component", "registry:ui", "registry:hook", "registry:theme", "registry:page"]>;
        target: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }, {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }>, "many">>;
    tailwind: z.ZodOptional<z.ZodObject<{
        config: z.ZodOptional<z.ZodObject<{
            content: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            plugins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        }, {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    }, {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    }>>;
    cssVars: z.ZodOptional<z.ZodObject<{
        light: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dark: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    }, {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    docs: z.ZodOptional<z.ZodString>;
}, "tailwind" | "dependencies" | "devDependencies" | "files" | "cssVars" | "docs">, "strip", z.ZodTypeAny, {
    tailwind?: {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    } | undefined;
    dependencies?: string[] | undefined;
    devDependencies?: string[] | undefined;
    files?: {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }[] | undefined;
    cssVars?: {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
    docs?: string | undefined;
}, {
    tailwind?: {
        config?: {
            content?: string[] | undefined;
            theme?: Record<string, any> | undefined;
            plugins?: string[] | undefined;
        } | undefined;
    } | undefined;
    dependencies?: string[] | undefined;
    devDependencies?: string[] | undefined;
    files?: {
        path: string;
        type: "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
        content?: string | undefined;
        target?: string | undefined;
    }[] | undefined;
    cssVars?: {
        light?: Record<string, string> | undefined;
        dark?: Record<string, string> | undefined;
    } | undefined;
    docs?: string | undefined;
}>;
//# sourceMappingURL=schema.d.ts.map