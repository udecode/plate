import type { FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const readyURL = new URL('/api/plite/ready', baseURL);
  const response = await fetch(readyURL);

  if (!response.ok) {
    throw new Error(
      `www server is not ready at ${readyURL}: ${response.status} ${response.statusText}`
    );
  }

  const payload = (await response.json()) as {
    devSource?: boolean;
    plite?: boolean;
  };

  if (!payload.plite || !payload.devSource) {
    throw new Error(
      `www browser specs run against the server pnpm dev:plite starts, with PLATE_WWW_PLITE=1 and PLATE_WWW_DEV_SOURCE=1; ${baseURL} reports ${JSON.stringify(
        payload
      )}. Unset PLAYWRIGHT_BASE_URL or point it at a server in that mode.`
    );
  }
}
