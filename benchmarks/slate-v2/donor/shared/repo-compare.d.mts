export declare const parsePackageManager: (repo: any) => Promise<"bun" | "node" | "pnpm" | "yarn">;
export declare const run: (command: any, args: any, cwd: any, env?: {}) => Promise<any>;
export declare const buildRepo: (repo: any, packageManager: any, filter: any) => Promise<void>;
export declare const benchmarkRepo: ({ benchmarkSource, env, packageManager, repo, }: {
    benchmarkSource: any;
    env: any;
    packageManager: any;
    repo: any;
}) => Promise<any>;
