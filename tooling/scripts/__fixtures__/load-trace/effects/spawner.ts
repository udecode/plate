export const runChild = () => Bun.spawnSync([process.execPath, '--version']);
