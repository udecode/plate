# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: markdown-streaming-contract.spec.ts >> markdown streaming contract >> static preview equals a fresh parse and keeps registered tags hidden
- Location: tests/browser/markdown-streaming-contract.spec.ts:1206:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "paragraph123paragraph"
Received: "﻿"
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - generic [ref=e8]: "Scenario:"
          - combobox "Scenario" [ref=e9]:
            - option "Columns" [selected]
            - option "Links"
            - option "Lists"
            - option "List With Image"
            - option "Nested Structure Block"
            - option "Table"
        - generic [ref=e10]:
          - generic [ref=e11]: "Chunks:"
          - combobox "Chunk size" [ref=e12]:
            - option "Recorded tokens" [selected]
            - option "16 characters"
            - option "64 characters"
            - option "256 characters"
        - generic [ref=e13]:
          - generic [ref=e14]: "Delay:"
          - combobox "Chunk delay" [ref=e15]:
            - option "10 ms" [selected]
            - option "50 ms"
            - option "100 ms"
            - option "200 ms"
        - generic [ref=e16]:
          - generic [ref=e17]: "Preview:"
          - combobox "Preview" [ref=e18]:
            - option "Editable"
            - option "Static" [selected]
      - generic [ref=e19]:
        - button "Previous chunk" [ref=e20]:
          - img
        - button "Start streaming" [ref=e21]:
          - img
        - button "Stop streaming" [disabled]:
          - img
        - button "Next chunk" [ref=e22]:
          - img
        - button "Reset streaming" [ref=e23]:
          - img
      - paragraph [ref=e24]: Previews publish the first chunk at once, then the latest draft every 32 ms, each continuing the previous partial parse. Finishing or stopping parses the draft strictly; reset and other changes cancel the stream without a final parse.
    - generic [ref=e27]:
      - generic [ref=e28]:
        - heading "Chunks (70/70)" [level=3] [ref=e29]
        - generic [ref=e30]:
          - generic [ref=e31]:
            - button "paragraph⤶⤶<column" [ref=e32]
            - button "Group" [ref=e33]
            - button ">⤶" [ref=e34]
          - generic [ref=e35]:
            - button "␣" [ref=e36]
            - button "␣<" [ref=e37]
            - button "column" [ref=e38]
            - button "␣width" [ref=e39]
            - button "=\"" [ref=e40]
            - button "33" [ref=e41]
            - button "." [ref=e42]
            - button "333" [ref=e43]
            - button "333" [ref=e44]
            - button "333" [ref=e45]
            - button "333" [ref=e46]
            - button "336" [ref=e47]
            - button "%\">⤶" [ref=e48]
          - generic [ref=e49]:
            - button "␣␣␣" [ref=e50]
            - button "␣" [ref=e51]
            - button "1" [ref=e52]
            - button "⤶" [ref=e53]
          - generic [ref=e54]:
            - button "␣" [ref=e55]
            - button "␣</" [ref=e56]
            - button "column" [ref=e57]
            - button ">⤶" [ref=e58]
          - generic [ref=e59]:
            - button "␣" [ref=e60]
            - button "␣<" [ref=e61]
            - button "column" [ref=e62]
            - button "␣width" [ref=e63]
            - button "=\"" [ref=e64]
            - button "33" [ref=e65]
            - button "." [ref=e66]
            - button "333" [ref=e67]
            - button "333" [ref=e68]
            - button "333" [ref=e69]
            - button "333" [ref=e70]
            - button "336" [ref=e71]
            - button "%\">⤶" [ref=e72]
          - generic [ref=e73]:
            - button "␣␣␣" [ref=e74]
            - button "␣" [ref=e75]
            - button "2" [ref=e76]
            - button "⤶" [ref=e77]
          - generic [ref=e78]:
            - button "␣" [ref=e79]
            - button "␣</" [ref=e80]
            - button "column" [ref=e81]
            - button ">⤶" [ref=e82]
          - generic [ref=e83]:
            - button "␣" [ref=e84]
            - button "␣<" [ref=e85]
            - button "column" [ref=e86]
            - button "␣width" [ref=e87]
            - button "=\"" [ref=e88]
            - button "33" [ref=e89]
            - button "." [ref=e90]
            - button "333" [ref=e91]
            - button "333" [ref=e92]
            - button "333" [ref=e93]
            - button "333" [ref=e94]
            - button "336" [ref=e95]
            - button "%\">⤶" [ref=e96]
          - generic [ref=e97]:
            - button "␣␣␣" [ref=e98]
            - button "␣" [ref=e99]
            - button "3" [ref=e100]
            - button "⤶" [ref=e101]
          - generic [ref=e102]:
            - button "␣" [ref=e103]
            - button "␣</" [ref=e104]
            - button "column" [ref=e105]
            - button ">⤶" [ref=e106]
          - generic [ref=e107]:
            - button "</" [ref=e108]
            - button "column" [ref=e109]
            - button "Group" [ref=e110]
            - button ">⤶⤶paragraph" [active] [ref=e111]
      - generic [ref=e112]:
        - heading "Editor Output" [level=3] [ref=e113]
        - paragraph [ref=e114]: "Finished: strict parse"
        - generic [ref=e115]:
          - generic [ref=e118]: paragraph
          - generic [ref=e120]:
            - generic [ref=e126]: "1"
            - generic [ref=e132]: "2"
            - generic [ref=e138]: "3"
          - generic [ref=e141]: paragraph
    - heading "Markdown Source" [level=2] [ref=e142]
    - textbox "Markdown source" [ref=e143]: paragraph <columnGroup> <column width="33.333333333333336%"> 1 </column> <column width="33.333333333333336%"> 2 </column> <column width="33.333333333333336%"> 3 </column> </columnGroup> paragraph
  - alert [ref=e144]
```

# Test source

```ts
  1138 |     for (const [index, cycle] of (
  1139 |       ['finish', 'cancel', 'finish'] as const
  1140 |     ).entries()) {
  1141 |       if (isAI(composition) && index > 0) await openAIMenuAgain(page);
  1142 |       await startStream(page, composition);
  1143 |       if (cycle === 'finish') {
  1144 |         await waitForFinish(page, composition, STREAM_CAP_MS);
  1145 |       } else {
  1146 |         await page.waitForTimeout(quarter);
  1147 |         if (isAI(composition)) {
  1148 |           await page.keyboard.press('Escape');
  1149 |           await waitForFinish(page, composition, STREAM_CAP_MS);
  1150 |         }
  1151 |       }
  1152 |       await (
  1153 |         isAI(composition)
  1154 |           ? page.getByRole('option', { name: 'Discard', exact: true })
  1155 |           : page.getByRole('button', { name: 'Reset streaming', exact: true })
  1156 |       ).click();
  1157 |     }
  1158 | 
  1159 |     return { afterBytes: await heap(), beforeBytes: before };
  1160 |   } finally {
  1161 |     await context.close();
  1162 |   }
  1163 | };
  1164 | 
  1165 | const runAICorrectness = async (
  1166 |   browser: Browser,
  1167 |   baseURL: string,
  1168 |   chunks: string[]
  1169 | ) => {
  1170 |   const context = await browser.newContext({
  1171 |     baseURL,
  1172 |     viewport: { height: 720, width: 1280 },
  1173 |   });
  1174 | 
  1175 |   try {
  1176 |     const page = await context.newPage();
  1177 |     await page.addInitScript(installInstrumentation, {
  1178 |       arrivalMs: ARRIVAL_MS,
  1179 |       chunks,
  1180 |       composition: 'ai' as const,
  1181 |     });
  1182 |     await openAI(page);
  1183 |     await page.evaluate(observeOutput, OUTPUT.ai);
  1184 |     await arm(page, true);
  1185 |     await startStream(page, 'ai');
  1186 |     await waitForFinish(page, 'ai', 30_000);
  1187 |     const { batches } = await readRecord(page);
  1188 |     const previews = batches.slice(0, -1);
  1189 | 
  1190 |     return {
  1191 |       eligible: previews.reduce((sum, batch) => sum + batch.eligible, 0),
  1192 |       html: await outputHTML(page, 'ai'),
  1193 |       kept: previews.reduce((sum, batch) => sum + batch.kept, 0),
  1194 |       text: await outputText(page, 'ai'),
  1195 |       texts: batches.map((batch) => batch.text ?? ''),
  1196 |     };
  1197 |   } finally {
  1198 |     await context.close();
  1199 |   }
  1200 | };
  1201 | 
  1202 | test.describe('markdown streaming contract', () => {
  1203 |   test.skip(BENCH, 'S5_BENCH runs the benchmark matrix instead.');
  1204 | 
  1205 |   for (const mode of ['editable', 'static'] as const) {
  1206 |     test(`${mode} preview equals a fresh parse and keeps registered tags hidden`, async ({
  1207 |       page,
  1208 |     }) => {
  1209 |       await page.addInitScript(installInstrumentation, {
  1210 |         arrivalMs: ARRIVAL_MS,
  1211 |         chunks: null,
  1212 |         composition: mode,
  1213 |       });
  1214 |       await openDemo(page, mode, null);
  1215 |       await page.evaluate(observeOutput, OUTPUT.demo);
  1216 |       await page
  1217 |         .getByLabel('Scenario', { exact: true })
  1218 |         .selectOption('columns');
  1219 |       await arm(page, true);
  1220 |       await startStream(page, mode);
  1221 |       await waitForFinish(page, mode, 30_000);
  1222 | 
  1223 |       const { batches } = await readRecord(page);
  1224 |       expect(batches.length).toBeGreaterThan(2);
  1225 |       for (const batch of batches) {
  1226 |         expect(batch.text).not.toMatch(/<\/?column/);
  1227 |       }
  1228 |       const streamed = batches.at(-1)!.text;
  1229 | 
  1230 |       // The last chunk takes the strict parse without any stream history.
  1231 |       await page
  1232 |         .getByRole('button', { name: 'Reset streaming', exact: true })
  1233 |         .click();
  1234 |       await page.locator('button:has-text("paragraph")').last().click();
  1235 |       await expect(page.locator('[data-stream-status]')).toHaveText(
  1236 |         'Finished: strict parse'
  1237 |       );
> 1238 |       expect(await outputText(page, mode)).toBe(streamed);
       |                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  1239 |     });
  1240 | 
  1241 |     test(`${mode} paused preview equals a fresh partial parse of its prefix`, async ({
  1242 |       page,
  1243 |     }) => {
  1244 |       const source = makeSource('rich', 6000);
  1245 | 
  1246 |       await page.addInitScript(installInstrumentation, {
  1247 |         arrivalMs: ARRIVAL_MS,
  1248 |         chunks: null,
  1249 |         composition: mode,
  1250 |       });
  1251 |       await openDemo(page, mode, source);
  1252 |       await page.evaluate(observeOutput, OUTPUT.demo);
  1253 |       await arm(page);
  1254 |       await startStream(page, mode);
  1255 |       const heading = page.getByRole('heading', { name: /^Chunks/ });
  1256 |       await expect(heading).toContainText(/\((2\d|[3-9]\d)\//);
  1257 |       await page
  1258 |         .getByRole('button', { name: 'Pause streaming', exact: true })
  1259 |         .click();
  1260 |       await expect(page.locator('[data-stream-status]')).toHaveText(
  1261 |         'Paused: partial preview'
  1262 |       );
  1263 |       await settle(page, 300);
  1264 |       const position = Number(
  1265 |         /\((\d+)\//.exec((await heading.textContent())!)![1]
  1266 |       );
  1267 |       const streamed = await outputText(page, mode);
  1268 |       const { batches } = await readRecord(page);
  1269 | 
  1270 |       // Navigating to the same prefix cancels the stream and parses it fresh.
  1271 |       await page
  1272 |         .getByRole('button', { name: 'Previous chunk', exact: true })
  1273 |         .click();
  1274 |       await page
  1275 |         .getByRole('button', { name: 'Next chunk', exact: true })
  1276 |         .click();
  1277 |       await expect(heading).toHaveText(
  1278 |         `Chunks (${position}/${toChunks(source).length})`
  1279 |       );
  1280 |       expect(await outputText(page, mode)).toBe(streamed);
  1281 | 
  1282 |       if (mode === 'static') {
  1283 |         const previews = batches.slice(1);
  1284 |         const kept = previews.reduce((sum, batch) => sum + batch.kept, 0);
  1285 |         const eligible = previews.reduce(
  1286 |           (sum, batch) => sum + batch.eligible,
  1287 |           0
  1288 |         );
  1289 |         expect(eligible).toBeGreaterThan(0);
  1290 |         expect(kept / eligible).toBeGreaterThan(0.9);
  1291 |       }
  1292 |     });
  1293 |   }
  1294 | 
  1295 |   test('AI insert preview matches a one-chunk response and keeps block hosts', async ({
  1296 |     browser,
  1297 |     baseURL,
  1298 |   }) => {
  1299 |     const source = makeSource('rich', 6000);
  1300 |     const streamed = await runAICorrectness(
  1301 |       browser,
  1302 |       baseURL!,
  1303 |       toChunks(source)
  1304 |     );
  1305 |     const whole = await runAICorrectness(browser, baseURL!, [source]);
  1306 | 
  1307 |     expect(streamed.text).toBe(whole.text);
  1308 |     // Reused blocks must render like fresh ones, decorations included.
  1309 |     expect(streamed.html).toBe(whole.html);
  1310 |     expect(streamed.text).toContain('Step 28');
  1311 |     expect(streamed.eligible).toBeGreaterThan(0);
  1312 |     expect(streamed.kept / streamed.eligible).toBeGreaterThan(0.9);
  1313 |   });
  1314 | 
  1315 |   // Streamed previews reuse unchanged leading blocks. Renders that read other
  1316 |   // blocks (list numbers, the table of contents, footnotes) must still match
  1317 |   // a render of the whole document at once.
  1318 |   test('static preview renders the final document like a fresh render', async ({
  1319 |     page,
  1320 |   }) => {
  1321 |     await page.addInitScript(installInstrumentation, {
  1322 |       arrivalMs: ARRIVAL_MS,
  1323 |       chunks: null,
  1324 |       composition: 'static' as const,
  1325 |     });
  1326 |     await openDemo(page, 'static', REUSE_SOURCE, 16);
  1327 |     await page.evaluate(observeOutput, OUTPUT.demo);
  1328 |     await arm(page);
  1329 |     await startStream(page, 'static');
  1330 |     await waitForFinish(page, 'static', 30_000);
  1331 |     const streamed = await outputHTML(page, 'static');
  1332 | 
  1333 |     await page
  1334 |       .getByRole('button', { name: 'Reset streaming', exact: true })
  1335 |       .click();
  1336 |     await page.locator('button:has-text("zzend")').last().click();
  1337 |     await expect(page.locator('[data-stream-status]')).toHaveText(
  1338 |       'Finished: strict parse'
```