import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getValueRecords, recordStoreToJson } from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { decide, storedDecisionSiteOf } from '../decision';
import type { AuthoredStep } from './writes';

const RECORDLESS_TOKEN = 'withdrawal';

const documentOf = (value: JsonEditorValue) => ({
  children: value.children,
  records: recordStoreToJson(getValueRecords(value)),
  roots: value.roots ?? {},
});

const sameDocument = (left: JsonEditorValue, right: JsonEditorValue) =>
  jsonEqual(documentOf(left), documentOf(right));

export const replaysWithdrawal = (
  { after, before }: AuthoredStep,
  changes: readonly string[],
  schema: CompiledEditorSchema
) => {
  const result = decide(
    before,
    {
      actions: new Map(changes.map((change) => [change, 'reject'] as const)),
      token: () => RECORDLESS_TOKEN,
      withdraws: true,
    },
    storedDecisionSiteOf(schema, before)
  );

  return result.status === 'decided' && sameDocument(result.value, after);
};
