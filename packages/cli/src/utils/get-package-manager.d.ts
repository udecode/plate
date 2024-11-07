export declare function getPackageManager(targetDir: string, { withFallback }?: {
    withFallback?: boolean;
}): Promise<'bun' | 'npm' | 'pnpm' | 'yarn'>;
export declare function getPackageRunner(cwd: string): Promise<"pnpm dlx" | "bunx" | "npx">;
//# sourceMappingURL=get-package-manager.d.ts.map