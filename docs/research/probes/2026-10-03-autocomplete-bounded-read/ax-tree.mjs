// Reads the editor root from Chromium's accessibility tree before, during and after a mention query on /blocks/mention-demo.
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000/blocks/mention-demo', { waitUntil: 'networkidle' });
const root = page.locator('[data-editor="true"][contenteditable="true"]').first();
await root.click();
await page.keyboard.press('End');
const cdp = await page.context().newCDPSession(page);
const rootAx = async () => {
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const editable = nodes.find((n) => n.properties?.some((p) => p.name === 'editable' && p.value?.value === 'richtext') && n.role?.value !== 'generic');
  const prop = (name) => editable?.properties?.find((p) => p.name === name)?.value?.value ?? null;
  const active = editable?.properties?.find((p) => p.name === 'activedescendant')?.value?.relatedNodes?.[0];
  const activeNode = active && nodes.find((n) => n.backendDOMNodeId === active.backendDOMNodeId);
  return { role: editable?.role?.value ?? null, expanded: prop('expanded'), hasPopup: prop('hasPopup'), autocomplete: prop('autocomplete'), multiline: prop('multiline'), activeOption: activeNode ? `${activeNode.role?.value}:${activeNode.name?.value}` : null };
};
console.log('before', JSON.stringify(await rootAx()));
await page.keyboard.type(' @biggs');
await page.getByRole('option', { exact: true, name: 'Biggs Darklighter' }).waitFor();
console.log('open', JSON.stringify(await rootAx()));
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
console.log('closed', JSON.stringify(await rootAx()));
await browser.close();
