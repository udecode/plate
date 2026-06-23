import type { FullConfig } from '@playwright/test';

const getBaseURL = (config: FullConfig) => {
  const projectBaseURL = config.projects.find(
    (project) => typeof project.use.baseURL === 'string'
  )?.use.baseURL;

  return (
    process.env.PLAYWRIGHT_BASE_URL ??
    (typeof projectBaseURL === 'string' ? projectBaseURL : undefined) ??
    'http://localhost:3100'
  );
};

export default async function globalSetup(config: FullConfig) {
  const baseURL = getBaseURL(config);
  const response = await fetch(new URL('/api/plite/ready', baseURL));

  if (!response.ok) {
    throw new Error(
      `Plite browser server is not ready: ${response.status} ${response.statusText}`
    );
  }

  const payload = (await response.json()) as {
    devSource?: boolean;
    plite?: boolean;
  };

  if (!payload.plite || !payload.devSource) {
    throw new Error(
      `Plite browser tests require PLATE_WWW_PLITE=1 and PLATE_WWW_DEV_SOURCE=1; got ${JSON.stringify(payload)}`
    );
  }
}
