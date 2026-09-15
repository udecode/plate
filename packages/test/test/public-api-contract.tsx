import { jsxt, projectTestSelectionRange } from '@platejs/test';
import { inspectZeroWidthPlaceholder } from '@platejs/test/browser';
import { openExample } from '@platejs/test/playwright';
import { classifyBrowserMobileTransportProof } from '@platejs/test/proof';
import { EditorTest, createTestEditor } from '@platejs/test/react';

const fixture = jsxt('editor', {}, jsxt('hp', {}, 'hello'));
const selection = projectTestSelectionRange(fixture.selection);

void EditorTest;
void classifyBrowserMobileTransportProof;
void createTestEditor;
void inspectZeroWidthPlaceholder;
void openExample;
void selection;
