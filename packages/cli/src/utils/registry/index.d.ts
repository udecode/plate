import type { Config } from "@/src/utils/get-config";
import { z } from "zod";
import { type registryItemFileSchema, registryIndexSchema, registryItemSchema } from "@/src/utils/registry/schema";
export declare const REGISTRY_URL: string;
export declare const REGISTRY_MAP: {
    magic: string;
    plate: string;
    shadcn: string;
};
export declare function getRegistryIndex(registryUrl?: string): Promise<{
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
}[] | undefined>;
export declare function getRegistryStyles(registryUrl?: string): Promise<{
    name: string;
    label: string;
}[]>;
export declare function getRegistryItem(name: string, style: string, registryUrl?: string): Promise<{
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
} | null>;
export declare function getRegistryBaseColors(): Promise<{
    label: string;
    name: string;
}[]>;
export declare function getRegistryBaseColor(baseColor: string): Promise<{
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
} | undefined>;
export declare function resolveTree(index: z.infer<typeof registryIndexSchema>, names: string[]): Promise<{
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
}[]>;
export declare function fetchTree(style: string, tree: z.infer<typeof registryIndexSchema>): Promise<{
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
}[] | undefined>;
export declare function getItemTargetPath(config: Config, item: Pick<z.infer<typeof registryItemSchema>, "type">, override?: string): Promise<string | null>;
export declare function fetchRegistry(paths: string[], registryUrl?: string, ignoreErrors?: boolean): Promise<unknown[]>;
export declare function getRegistryItemFileTargetPath(file: z.infer<typeof registryItemFileSchema>, config: Config, override?: string): string;
export declare function registryResolveItemsTree(names: z.infer<typeof registryItemSchema>["name"][], config: Config): Promise<{
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
} | null>;
export declare function registryGetTheme(name: string, config: Config): Promise<{
    cssVars: {
        dark: {};
        light: {
            radius: string;
        };
    };
    name: string;
    tailwind: {
        config: {
            theme: {
                extend: {
                    borderRadius: {
                        lg: string;
                        md: string;
                        sm: string;
                    };
                    colors: {};
                };
            };
        };
    };
    type: "registry:theme";
} | null>;
export declare function getDefaultConfig(defaultConfig: Config, registryUrl?: string): Promise<{
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
//# sourceMappingURL=index.d.ts.map