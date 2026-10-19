import { enableKernelTraceRetention } from '../../dom/internal';
import { attachPliteBrowserHandle } from './browser-handle';
import { registerBrowserHandle } from './runtime-browser-handle-events';

/**
 * Expose the browser test handle that `@platejs/test` reads on every
 * `Editable` root mounted afterwards, and keep the kernel trace it reads.
 *
 * Call once at module scope in a test or development entry, before the first
 * editor mounts. Production entries never call it, so their bundles drop the
 * handle. Calling it again changes nothing.
 */
export const installBrowserHandle = () => {
  registerBrowserHandle(attachPliteBrowserHandle);
  enableKernelTraceRetention();
};
