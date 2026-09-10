import { isRecord } from './record';

export const areJsonLikeValuesEqual = (
  left: unknown,
  right: unknown
): boolean => {
  if (
    left === right ||
    (typeof left === 'number' &&
      typeof right === 'number' &&
      Number.isNaN(left) &&
      Number.isNaN(right))
  ) {
    return true;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (
      !Array.isArray(left) ||
      !Array.isArray(right) ||
      left.length !== right.length
    ) {
      return false;
    }

    let index = 0;

    while (index < left.length) {
      if (!areJsonLikeValuesEqual(left[index], right[index])) {
        return false;
      }
      index += 1;
    }

    return true;
  }

  if (!isRecord(left) || !isRecord(right)) {
    return false;
  }

  let leftDefinedKeyCount = 0;

  for (const key in left) {
    if (!Object.hasOwn(left, key)) {
      continue;
    }

    const leftValue = left[key];

    if (leftValue === undefined) {
      continue;
    }

    if (!areJsonLikeValuesEqual(leftValue, right[key])) {
      return false;
    }

    leftDefinedKeyCount += 1;
  }

  let rightDefinedKeyCount = 0;

  for (const key in right) {
    if (!Object.hasOwn(right, key) || right[key] === undefined) {
      continue;
    }

    rightDefinedKeyCount += 1;
  }

  return leftDefinedKeyCount === rightDefinedKeyCount;
};
