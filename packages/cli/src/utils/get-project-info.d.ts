import { type Framework } from '@/src/utils/frameworks';
import { type Config } from '@/src/utils/get-config';
type ProjectInfo = {
    aliasPrefix: string | null;
    framework: Framework;
    isRSC: boolean;
    isSrcDir: boolean;
    isTsx: boolean;
    tailwindConfigFile: string | null;
    tailwindCssFile: string | null;
};
export declare function getProjectInfo(cwd: string): Promise<ProjectInfo | null>;
export declare function getTailwindCssFile(cwd: string): Promise<string | null>;
export declare function getTailwindConfigFile(cwd: string): Promise<string | null>;
export declare function getTsConfigAliasPrefix(cwd: string): Promise<string | null>;
export declare function isTypeScriptProject(cwd: string): Promise<boolean>;
export declare function getTsConfig(): Promise<any>;
export declare function getProjectConfig(cwd: string, defaultProjectInfo?: ProjectInfo | null): Promise<[Config, boolean] | null>;
export {};
//# sourceMappingURL=get-project-info.d.ts.map