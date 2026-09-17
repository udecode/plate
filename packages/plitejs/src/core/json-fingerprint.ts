import { canonicalJsonKey } from './change/transform';

/** Deterministic fingerprint for already validated JSON-compatible data. */
export const fingerprintEditorJson = (value: unknown): string => {
  const canonical = canonicalJsonKey(value);
  let first = 0x81_1c_9d_c5;
  let second = 0x9e_37_79_b9;

  for (let index = 0; index < canonical.length; index += 1) {
    const unit = canonical.charCodeAt(index);

    first = Math.imul(first ^ unit, 0x01_00_01_93) >>> 0;
    second = Math.imul(second ^ (unit + index), 0x85_eb_ca_6b) >>> 0;
  }

  return `${first.toString(36)}${second.toString(36)}`;
};
