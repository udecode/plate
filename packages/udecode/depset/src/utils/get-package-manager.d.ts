export type PackageManager = 'bun' | 'npm' | 'pnpm' | 'yarn';
export declare function getPackageManager(targetDir: string, { programmatic, // ni specific
withFallback, }?: {
    programmatic?: boolean;
    withFallback?: boolean;
}): Promise<PackageManager>;
//# sourceMappingURL=get-package-manager.d.ts.map