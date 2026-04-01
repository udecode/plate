export const MARKDOWN_STREAMING_DEMO_GATEWAY_KEY_STORAGE_KEY =
  'plate-markdown-streaming-demo-gateway-key';

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase();
}

export function isLocalMarkdownStreamingDemoHost(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);

  return (
    normalizedHostname === 'localhost' ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === '[::1]' ||
    normalizedHostname.endsWith('.local')
  );
}

export function shouldPromptForMarkdownStreamingDemoGatewayKey(
  hostname: string
) {
  return !isLocalMarkdownStreamingDemoHost(hostname);
}

export function normalizeMarkdownStreamingDemoGatewayApiKey(
  apiKey: string | undefined
) {
  const normalizedApiKey = apiKey?.trim();

  return normalizedApiKey ? normalizedApiKey : undefined;
}
