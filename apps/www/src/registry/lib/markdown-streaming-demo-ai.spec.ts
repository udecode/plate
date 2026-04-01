import { describe, expect, it } from 'bun:test';

import {
  normalizeMarkdownStreamingDemoGatewayApiKey,
  shouldPromptForMarkdownStreamingDemoGatewayKey,
} from './markdown-streaming-demo-ai';

describe('shouldPromptForMarkdownStreamingDemoGatewayKey', () => {
  it('skips the dialog for local development hosts', () => {
    expect(shouldPromptForMarkdownStreamingDemoGatewayKey('localhost')).toBe(
      false
    );
    expect(shouldPromptForMarkdownStreamingDemoGatewayKey('127.0.0.1')).toBe(
      false
    );
    expect(shouldPromptForMarkdownStreamingDemoGatewayKey('[::1]')).toBe(false);
    expect(
      shouldPromptForMarkdownStreamingDemoGatewayKey('stream-demo.local')
    ).toBe(false);
  });

  it('requires the dialog for hosted environments', () => {
    expect(shouldPromptForMarkdownStreamingDemoGatewayKey('platejs.org')).toBe(
      true
    );
    expect(
      shouldPromptForMarkdownStreamingDemoGatewayKey(
        'plate-git-demo-preview.vercel.app'
      )
    ).toBe(true);
  });
});

describe('normalizeMarkdownStreamingDemoGatewayApiKey', () => {
  it('trims valid keys and drops blank values', () => {
    expect(normalizeMarkdownStreamingDemoGatewayApiKey(undefined)).toBe(
      undefined
    );
    expect(normalizeMarkdownStreamingDemoGatewayApiKey('   ')).toBe(undefined);
    expect(
      normalizeMarkdownStreamingDemoGatewayApiKey('  gateway-demo-key  ')
    ).toBe('gateway-demo-key');
  });
});
