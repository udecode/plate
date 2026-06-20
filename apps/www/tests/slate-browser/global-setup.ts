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
  const response = await fetch(new URL('/api/slate/ready', baseURL));

  if (!response.ok) {
    throw new Error(
      `Slate browser server is not ready: ${response.status} ${response.statusText}`
    );
  }

  const payload = (await response.json()) as {
    devSource?: boolean;
    slate?: boolean;
  };

  if (!payload.slate || !payload.devSource) {
    throw new Error(
      `Slate browser tests require PLATE_WWW_SLATE=1 and PLATE_WWW_DEV_SOURCE=1; got ${JSON.stringify(payload)}`
    );
  }
}
