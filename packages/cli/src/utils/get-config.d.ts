import { z } from 'zod';
export declare const DEFAULT_STYLE = "default";
export declare const DEFAULT_COMPONENTS = "@/components";
export declare const DEFAULT_UTILS = "@/lib/utils";
export declare const DEFAULT_TAILWIND_CSS = "app/globals.css";
export declare const DEFAULT_TAILWIND_CONFIG = "tailwind.config.js";
export declare const DEFAULT_TAILWIND_BASE_COLOR = "slate";
export declare const rawConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    aliases: z.ZodObject<{
        components: z.ZodString;
        hooks: z.ZodOptional<z.ZodString>;
        lib: z.ZodOptional<z.ZodString>;
        ui: z.ZodOptional<z.ZodString>;
        utils: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    }, {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    }>;
    name: z.ZodOptional<z.ZodString>;
    registries: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        aliases: z.ZodOptional<z.ZodObject<{
            components: z.ZodOptional<z.ZodString>;
            hooks: z.ZodOptional<z.ZodString>;
            lib: z.ZodOptional<z.ZodString>;
            ui: z.ZodOptional<z.ZodString>;
            utils: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        }, {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        }>>;
        rsc: z.ZodOptional<z.ZodBoolean>;
        style: z.ZodOptional<z.ZodString>;
        tailwind: z.ZodOptional<z.ZodObject<{
            baseColor: z.ZodOptional<z.ZodString>;
            config: z.ZodOptional<z.ZodString>;
            css: z.ZodOptional<z.ZodString>;
            cssVariables: z.ZodOptional<z.ZodBoolean>;
            prefix: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        }, {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        }>>;
        tsx: z.ZodOptional<z.ZodBoolean>;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }>>>;
    rsc: z.ZodDefault<z.ZodBoolean>;
    style: z.ZodString;
    tailwind: z.ZodObject<{
        baseColor: z.ZodString;
        config: z.ZodString;
        css: z.ZodString;
        cssVariables: z.ZodDefault<z.ZodBoolean>;
        prefix: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        baseColor: string;
        config: string;
        css: string;
        cssVariables: boolean;
        prefix?: string | undefined;
    }, {
        baseColor: string;
        config: string;
        css: string;
        cssVariables?: boolean | undefined;
        prefix?: string | undefined;
    }>;
    tsx: z.ZodDefault<z.ZodBoolean>;
    url: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    aliases: {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    };
    rsc: boolean;
    style: string;
    tailwind: {
        baseColor: string;
        config: string;
        css: string;
        cssVariables: boolean;
        prefix?: string | undefined;
    };
    tsx: boolean;
    url?: string | undefined;
    $schema?: string | undefined;
    name?: string | undefined;
    registries?: Record<string, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }> | undefined;
}, {
    aliases: {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    };
    style: string;
    tailwind: {
        baseColor: string;
        config: string;
        css: string;
        cssVariables?: boolean | undefined;
        prefix?: string | undefined;
    };
    rsc?: boolean | undefined;
    tsx?: boolean | undefined;
    url?: string | undefined;
    $schema?: string | undefined;
    name?: string | undefined;
    registries?: Record<string, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }> | undefined;
}>;
export type RawConfig = z.infer<typeof rawConfigSchema>;
export declare const configSchema: z.ZodObject<z.objectUtil.extendShape<{
    $schema: z.ZodOptional<z.ZodString>;
    aliases: z.ZodObject<{
        components: z.ZodString;
        hooks: z.ZodOptional<z.ZodString>;
        lib: z.ZodOptional<z.ZodString>;
        ui: z.ZodOptional<z.ZodString>;
        utils: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    }, {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    }>;
    name: z.ZodOptional<z.ZodString>;
    registries: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        aliases: z.ZodOptional<z.ZodObject<{
            components: z.ZodOptional<z.ZodString>;
            hooks: z.ZodOptional<z.ZodString>;
            lib: z.ZodOptional<z.ZodString>;
            ui: z.ZodOptional<z.ZodString>;
            utils: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        }, {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        }>>;
        rsc: z.ZodOptional<z.ZodBoolean>;
        style: z.ZodOptional<z.ZodString>;
        tailwind: z.ZodOptional<z.ZodObject<{
            baseColor: z.ZodOptional<z.ZodString>;
            config: z.ZodOptional<z.ZodString>;
            css: z.ZodOptional<z.ZodString>;
            cssVariables: z.ZodOptional<z.ZodBoolean>;
            prefix: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        }, {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        }>>;
        tsx: z.ZodOptional<z.ZodBoolean>;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }>>>;
    rsc: z.ZodDefault<z.ZodBoolean>;
    style: z.ZodString;
    tailwind: z.ZodObject<{
        baseColor: z.ZodString;
        config: z.ZodString;
        css: z.ZodString;
        cssVariables: z.ZodDefault<z.ZodBoolean>;
        prefix: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        baseColor: string;
        config: string;
        css: string;
        cssVariables: boolean;
        prefix?: string | undefined;
    }, {
        baseColor: string;
        config: string;
        css: string;
        cssVariables?: boolean | undefined;
        prefix?: string | undefined;
    }>;
    tsx: z.ZodDefault<z.ZodBoolean>;
    url: z.ZodOptional<z.ZodString>;
}, {
    resolvedPaths: z.ZodObject<{
        components: z.ZodString;
        cwd: z.ZodString;
        hooks: z.ZodString;
        lib: z.ZodString;
        tailwindConfig: z.ZodString;
        tailwindCss: z.ZodString;
        ui: z.ZodString;
        utils: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        components: string;
        hooks: string;
        lib: string;
        ui: string;
        utils: string;
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
    }, {
        components: string;
        hooks: string;
        lib: string;
        ui: string;
        utils: string;
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
    }>;
}>, "strict", z.ZodTypeAny, {
    aliases: {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    };
    rsc: boolean;
    style: string;
    tailwind: {
        baseColor: string;
        config: string;
        css: string;
        cssVariables: boolean;
        prefix?: string | undefined;
    };
    tsx: boolean;
    resolvedPaths: {
        components: string;
        hooks: string;
        lib: string;
        ui: string;
        utils: string;
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
    };
    url?: string | undefined;
    $schema?: string | undefined;
    name?: string | undefined;
    registries?: Record<string, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }> | undefined;
}, {
    aliases: {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    };
    style: string;
    tailwind: {
        baseColor: string;
        config: string;
        css: string;
        cssVariables?: boolean | undefined;
        prefix?: string | undefined;
    };
    resolvedPaths: {
        components: string;
        hooks: string;
        lib: string;
        ui: string;
        utils: string;
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
    };
    rsc?: boolean | undefined;
    tsx?: boolean | undefined;
    url?: string | undefined;
    $schema?: string | undefined;
    name?: string | undefined;
    registries?: Record<string, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }> | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
export declare function getConfig(cwd: string): Promise<{
    aliases: {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    };
    rsc: boolean;
    style: string;
    tailwind: {
        baseColor: string;
        config: string;
        css: string;
        cssVariables: boolean;
        prefix?: string | undefined;
    };
    tsx: boolean;
    resolvedPaths: {
        components: string;
        hooks: string;
        lib: string;
        ui: string;
        utils: string;
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
    };
    url?: string | undefined;
    $schema?: string | undefined;
    name?: string | undefined;
    registries?: Record<string, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }> | undefined;
} | null>;
export declare function resolveConfigPaths(cwd: string, config: RawConfig): Promise<{
    aliases: {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    };
    rsc: boolean;
    style: string;
    tailwind: {
        baseColor: string;
        config: string;
        css: string;
        cssVariables: boolean;
        prefix?: string | undefined;
    };
    tsx: boolean;
    resolvedPaths: {
        components: string;
        hooks: string;
        lib: string;
        ui: string;
        utils: string;
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
    };
    url?: string | undefined;
    $schema?: string | undefined;
    name?: string | undefined;
    registries?: Record<string, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }> | undefined;
}>;
export declare function getRawConfig(cwd: string): Promise<RawConfig | null>;
//# sourceMappingURL=get-config.d.ts.map