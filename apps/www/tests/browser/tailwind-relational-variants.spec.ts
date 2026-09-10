import { expect, test } from '@playwright/test';
import { compile } from 'tailwindcss';

test('Tailwind group and peer variants preserve hover, focus, names and negation', async ({
  page,
}) => {
  const candidates = [
    'group-hover:opacity-100',
    'group-hover/menu-item:opacity-100',
    'group-focus-within:opacity-100',
    'peer-hover/menu-button:opacity-100',
    'group-data-[active=true]:opacity-100',
    'group-[&:is(:hover,:focus)]:opacity-100',
    'group-hover:after:opacity-100',
    'not-group-hover:opacity-100',
    'group-hover:peer-hover:opacity-100',
  ];
  const compiler = await compile('@tailwind utilities;');
  await page.setContent(`
    <style>
      .target { opacity: 0; }
      .target::after { content: 'after'; opacity: 0; }
      .region { padding: 20px; }
      ${compiler.build(candidates)}
    </style>
    <div id="group" class="region group group/menu-item" data-active="true">
      <input aria-label="Focus group">
      <span id="hover" class="target group-hover:opacity-100">hover</span>
      <span id="named" class="target group-hover/menu-item:opacity-100">named</span>
      <span id="focus" class="target group-focus-within:opacity-100">focus</span>
      <span id="data" class="target group-data-[active=true]:opacity-100">data</span>
      <span id="arbitrary" class="target group-[&:is(:hover,:focus)]:opacity-100">arbitrary</span>
      <span id="negation" class="target not-group-hover:opacity-100">negation</span>
      <span id="after" class="target group-hover:after:opacity-100">pseudo</span>
      <button class="peer peer/menu-button">Peer</button>
      <span id="peer" class="target peer-hover/menu-button:opacity-100">peer</span>
      <span id="combined" class="target group-hover:peer-hover:opacity-100">combined</span>
    </div>
    <div class="region group/other"><span id="foreign" class="target group-hover/menu-item:opacity-100">foreign</span></div>
  `);
  await page.mouse.move(1200, 650);
  for (const id of [
    'hover',
    'named',
    'focus',
    'arbitrary',
    'peer',
    'combined',
    'foreign',
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCSS('opacity', '0');
  }
  await expect(page.locator('#data')).toHaveCSS('opacity', '1');
  await expect(page.locator('#negation')).toHaveCSS('opacity', '1');
  await page.locator('#group').hover();
  for (const id of ['hover', 'named', 'arbitrary']) {
    await expect(page.locator(`#${id}`)).toHaveCSS('opacity', '1');
  }
  await expect(page.locator('#negation')).toHaveCSS('opacity', '0');
  expect(
    await page
      .locator('#after')
      .evaluate((element) => getComputedStyle(element, '::after').opacity)
  ).toBe('1');
  await page.getByLabel('Focus group').focus();
  await expect(page.locator('#focus')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Peer' }).hover();
  for (const id of ['peer', 'combined']) {
    await expect(page.locator(`#${id}`)).toHaveCSS('opacity', '1');
  }
  await page.locator('#foreign').hover();
  await expect(page.locator('#foreign')).toHaveCSS('opacity', '0');
});
