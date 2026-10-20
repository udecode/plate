import { appendFileSync } from 'node:fs';

import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, expect } from 'vitest';

import { auditDOMTextProofs } from '../../src/dom/internal';
import { installBrowserHandle } from '../../src/react';

expect.extend(matchers);
// Trace contracts read the kernel trace without mounting an Editable.
installBrowserHandle();

Object.defineProperty(globalThis, 'React', {
  configurable: true,
  value: React,
  writable: true,
});

const audit =
  process.env.PLITE_PROOF_AUDIT === 'off' ? null : auditDOMTextProofs();

const auditReport = process.env.PLITE_PROOF_AUDIT_REPORT;

if (auditReport) {
  afterAll(() => {
    appendFileSync(
      auditReport,
      `${expect.getState().testPath} ${audit?.point} ${audit?.range}\n`
    );
  });
}

afterEach(() => {
  cleanup();
});
