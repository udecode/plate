import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLinkMarkValidator } from './link-validator.js';
import * as rules from './rules/index.js';

describe('createLinkMarkValidator', () => {
  const mockEditor = {};
  const mockLogger = { debug: vi.fn() };
  const mockTransaction = {};

  beforeEach(() => {
    vi.spyOn(rules, 'ensureValidLinkRID').mockImplementation(() => ({
      modified: false,
      results: [],
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should define requiredElements with link mark', () => {
    const validator = createLinkMarkValidator({ editor: mockEditor, logger: mockLogger });
    expect(validator.requiredElements).toEqual({
      marks: ['link'],
    });
  });

  it('should call ensureValidLinkRID with links array', () => {
    const validator = createLinkMarkValidator({ editor: mockEditor, logger: mockLogger });

    const analysis = { link: [{ attrs: { rId: null, href: 'https://example.com' } }] };
    validator(mockTransaction, analysis);

    expect(rules.ensureValidLinkRID).toHaveBeenCalledWith(analysis.link, mockEditor, mockTransaction, mockLogger);
  });

  it('should return modified = false and empty results if rule returns no issues', () => {
    const validator = createLinkMarkValidator({ editor: mockEditor, logger: mockLogger });

    const result = validator(mockTransaction, { link: [] });

    expect(result).toEqual({
      modified: false,
      results: [],
    });
  });

  it('should return correct modified and results from rule', () => {
    rules.ensureValidLinkRID.mockReturnValueOnce({
      modified: true,
      results: [{ message: 'Added rId to link at pos 42' }],
    });

    const validator = createLinkMarkValidator({ editor: mockEditor, logger: mockLogger });

    const result = validator(mockTransaction, { link: [{ attrs: {} }] });

    expect(result).toEqual({
      modified: true,
      results: [{ message: 'Added rId to link at pos 42' }],
    });
  });

  it('should not fail if analysis.link is undefined', () => {
    const validator = createLinkMarkValidator({ editor: mockEditor, logger: mockLogger });

    validator(mockTransaction, {}); // No link key

    expect(rules.ensureValidLinkRID).toHaveBeenCalledWith([], mockEditor, mockTransaction, mockLogger);
  });
});
