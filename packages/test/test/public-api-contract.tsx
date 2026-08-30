import { jsxt, projectTestSelectionRange } from '@platejs/test';
import { inspectZeroWidthPlaceholder } from '@platejs/test/browser';
import { openExample } from '@platejs/test/playwright';
import { classifyBrowserMobileTransportProof } from '@platejs/test/proof';
import { PlateTest, createPlateTestEditor } from '@platejs/test/react';

const fixture = jsxt('editor', {}, jsxt('hp', {}, 'hello'));
const selection = projectTestSelectionRange(fixture.selection);

void PlateTest;
void classifyBrowserMobileTransportProof;
void createPlateTestEditor;
void inspectZeroWidthPlaceholder;
void openExample;
void selection;
