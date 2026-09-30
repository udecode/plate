# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: markdown-streaming-contract.spec.ts >> markdown streaming contract >> static paused preview equals a fresh partial parse of its prefix
- Location: tests/browser/markdown-streaming-contract.spec.ts:1241:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Step 0Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/0.keep orderavoid churntsconst m = new Map<string, number>();Step 1Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/1.keep orderavoid churntsconst m = new Map<string, number>();Step 2Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/2.keep orderavoid churntsconst m = new Map<string, number>();Step 3Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/3.keep orderavoid churntsconst m = new Map<string, number>();Step 4Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/4.keep orderavoid churntsconst m = new Map<string, number>();Step 5Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/5.keep orderavoid churntsconst m = new Map<string, number>();Step 6Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/6.keep orderavoid churntsconst m = new Map<string, number>();Step 7Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/7.keep orderavoid churntsconst m = new Map<string, number>();Step 8Use a Map<string, number> or Map<string, nu"
Received: "Step 0Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/0.keep orderavoid churntsconst m = new Map<string, number>();Step 1Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/1.keep orderavoid churntsconst m = new Map<string, number>();Step 2Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/2.keep orderavoid churntsconst m = new Map<string, number>();Step 3Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/3.keep orderavoid churntsconst m = new Map<string, number>();Step 4Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/4.keep orderavoid churntsconst m = new Map<string, number>();Step 5Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/5.keep orderavoid churntsconst m = new Map<string, number>();Step 6Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/6.keep orderavoid churntsconst m = new Map<string, number>();Step 7Use a Map<string, number> or Map<string, number> for {key: value} lookups when x<y. See https://example.com/7.keep orderavoid churntsconst m = new Map<string, number>("
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
            - option "Columns"
            - option "Links"
            - option "Lists"
            - option "List With Image"
            - option "Nested Structure Block"
            - option "Table"
            - option "Custom" [selected]
        - generic [ref=e10]:
          - generic [ref=e11]: "Chunks:"
          - combobox "Chunk size" [ref=e12]:
            - option "Words"
            - option "16 characters"
            - option "64 characters" [selected]
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
        - button "Next chunk" [active] [ref=e22]:
          - img
        - button "Reset streaming" [ref=e23]:
          - img
      - paragraph [ref=e24]: Previews publish the first chunk at once, then the latest draft every 32 ms, each continuing the previous partial parse. Finishing or stopping parses the draft strictly; reset and other changes cancel the stream without a final parse.
    - generic [ref=e27]:
      - generic [ref=e28]:
        - heading "Chunks (27/94)" [level=3] [ref=e29]
        - generic [ref=e30]:
          - generic [ref=e31]:
            - 'button "##␣Step␣0⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣fo" [ref=e32]'
            - 'button "r␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://example.com/0>.⤶⤶-" [ref=e33]'
            - 'button "␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string," [ref=e34]'
            - 'button "␣number>();⤶```⤶⤶##␣Step␣1⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<s" [ref=e35]'
            - 'button "tring,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://e" [ref=e36]'
            - 'button "xample.com/1>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣" [ref=e37]'
            - 'button "=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣2⤶⤶Use␣a␣`Map<string,␣" [ref=e38]'
            - 'button "number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣when␣x<" [ref=e39]'
            - button "y.␣See␣<https://example.com/2>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn" [ref=e40]
            - 'button "_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣3⤶⤶Us" [ref=e41]'
            - 'button "e␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣value" [ref=e42]'
            - 'button "}␣lookups␣when␣x<y.␣See␣<https://example.com/3>.⤶⤶-␣keep␣**order" [ref=e43]'
            - 'button "**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶`" [ref=e44]'
            - 'button "``⤶⤶##␣Step␣4⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number" [ref=e45]'
            - 'button ">␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://example.com/4>" [ref=e46]'
            - 'button ".⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<str" [ref=e47]'
            - 'button "ing,␣number>();⤶```⤶⤶##␣Step␣5⤶⤶Use␣a␣`Map<string,␣number>`␣or␣M" [ref=e48]'
            - 'button "ap<string,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https" [ref=e49]'
            - 'button "://example.com/5>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶cons" [ref=e50]'
            - 'button "t␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣6⤶⤶Use␣a␣`Map<stri" [ref=e51]'
            - 'button "ng,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣whe" [ref=e52]'
            - button "n␣x<y.␣See␣<https://example.com/6>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_c" [ref=e53]
            - 'button "hurn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣7" [ref=e54]'
            - 'button "⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣v" [ref=e55]'
            - 'button "alue}␣lookups␣when␣x<y.␣See␣<https://example.com/7>.⤶⤶-␣keep␣**o" [ref=e56]'
            - 'button "rder**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>(" [ref=e57]'
            - 'button ");⤶```⤶⤶##␣Step␣8⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣nu" [ref=e58]'
            - 'button "mber>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://example.co" [ref=e59]'
            - 'button "m/8>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map" [ref=e60]'
            - 'button "<string,␣number>();⤶```⤶⤶##␣Step␣9⤶⤶Use␣a␣`Map<string,␣number>`␣" [ref=e61]'
            - 'button "or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<h" [ref=e62]'
            - 'button "ttps://example.com/9>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶" [ref=e63]'
          - generic [ref=e64]:
            - 'button "const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣10⤶⤶Use␣a␣`Map" [ref=e65]'
            - 'button "<string,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookup" [ref=e66]'
            - button "s␣when␣x<y.␣See␣<https://example.com/10>.⤶⤶-␣keep␣**order**⤶-␣av" [ref=e67]
            - 'button "oid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣" [ref=e68]'
            - 'button "Step␣11⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣for␣" [ref=e69]'
            - 'button "{key:␣value}␣lookups␣when␣x<y.␣See␣<https://example.com/11>.⤶⤶-␣" [ref=e70]'
            - 'button "keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣" [ref=e71]'
            - 'button "number>();⤶```⤶⤶##␣Step␣12⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<s" [ref=e72]'
            - 'button "tring,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://e" [ref=e73]'
            - 'button "xample.com/12>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m" [ref=e74]'
            - 'button "␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣13⤶⤶Use␣a␣`Map<string" [ref=e75]'
            - 'button ",␣number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣when␣" [ref=e76]'
            - button "x<y.␣See␣<https://example.com/13>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_ch" [ref=e77]
            - 'button "urn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣14" [ref=e78]'
            - 'button "⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣v" [ref=e79]'
            - 'button "alue}␣lookups␣when␣x<y.␣See␣<https://example.com/14>.⤶⤶-␣keep␣**" [ref=e80]'
            - 'button "order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>" [ref=e81]'
            - 'button "();⤶```⤶⤶##␣Step␣15⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣" [ref=e82]'
            - 'button "number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://example." [ref=e83]'
            - 'button "com/15>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣" [ref=e84]'
            - 'button "Map<string,␣number>();⤶```⤶⤶##␣Step␣16⤶⤶Use␣a␣`Map<string,␣numbe" [ref=e85]'
            - 'button "r>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣Se" [ref=e86]'
            - 'button "e␣<https://example.com/16>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶`" [ref=e87]'
            - 'button "``ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣17⤶⤶Use␣a" [ref=e88]'
            - 'button "␣`Map<string,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣l" [ref=e89]'
            - button "ookups␣when␣x<y.␣See␣<https://example.com/17>.⤶⤶-␣keep␣**order**" [ref=e90]
            - 'button "⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```" [ref=e91]'
            - 'button "⤶⤶##␣Step␣18⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>" [ref=e92]'
            - 'button "␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://example.com/18>" [ref=e93]'
            - 'button ".⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<str" [ref=e94]'
            - 'button "ing,␣number>();⤶```⤶⤶##␣Step␣19⤶⤶Use␣a␣`Map<string,␣number>`␣or␣" [ref=e95]'
            - 'button "Map<string,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<http" [ref=e96]'
            - 'button "s://example.com/19>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶co" [ref=e97]'
            - 'button "nst␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣20⤶⤶Use␣a␣`Map<s" [ref=e98]'
            - 'button "tring,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣" [ref=e99]'
            - button "when␣x<y.␣See␣<https://example.com/20>.⤶⤶-␣keep␣**order**⤶-␣avoi" [ref=e100]
            - 'button "d␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣St" [ref=e101]'
            - 'button "ep␣21⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣for␣{k" [ref=e102]'
            - 'button "ey:␣value}␣lookups␣when␣x<y.␣See␣<https://example.com/21>.⤶⤶-␣ke" [ref=e103]'
            - 'button "ep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣nu" [ref=e104]'
            - 'button "mber>();⤶```⤶⤶##␣Step␣22⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<str" [ref=e105]'
            - 'button "ing,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://exa" [ref=e106]'
            - 'button "mple.com/22>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=" [ref=e107]'
            - 'button "␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣23⤶⤶Use␣a␣`Map<string,␣" [ref=e108]'
            - 'button "number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣when␣x<" [ref=e109]'
            - button "y.␣See␣<https://example.com/23>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_chur" [ref=e110]
            - 'button "n_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣24⤶⤶" [ref=e111]'
          - generic [ref=e112]:
            - 'button "Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣val" [ref=e113]'
            - 'button "ue}␣lookups␣when␣x<y.␣See␣<https://example.com/24>.⤶⤶-␣keep␣**or" [ref=e114]'
            - 'button "der**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>()" [ref=e115]'
            - 'button ";⤶```⤶⤶##␣Step␣25⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣nu" [ref=e116]'
            - 'button "mber>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://example.co" [ref=e117]'
            - 'button "m/25>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Ma" [ref=e118]'
            - 'button "p<string,␣number>();⤶```⤶⤶##␣Step␣26⤶⤶Use␣a␣`Map<string,␣number>" [ref=e119]'
            - 'button "`␣or␣Map<string,␣number>␣for␣{key:␣value}␣lookups␣when␣x<y.␣See␣" [ref=e120]'
            - 'button "<https://example.com/26>.⤶⤶-␣keep␣**order**⤶-␣avoid␣_churn_⤶⤶```" [ref=e121]'
            - 'button "ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶##␣Step␣27⤶⤶Use␣a␣`" [ref=e122]'
            - 'button "Map<string,␣number>`␣or␣Map<string,␣number>␣for␣{key:␣value}␣loo" [ref=e123]'
            - button "kups␣when␣x<y.␣See␣<https://example.com/27>.⤶⤶-␣keep␣**order**⤶-" [ref=e124]
            - 'button "␣avoid␣_churn_⤶⤶```ts⤶const␣m␣=␣new␣Map<string,␣number>();⤶```⤶⤶" [ref=e125]'
          - generic [ref=e126]:
            - 'button "##␣Step␣28⤶⤶Use␣a␣`Map<string,␣number>`␣or␣Map<string,␣number>␣f" [ref=e127]'
            - 'button "or␣{key:␣value}␣lookups␣when␣x<y.␣See␣<https://e" [ref=e128]'
      - generic [ref=e129]:
        - heading "Editor Output" [level=3] [ref=e130]
        - paragraph [ref=e131]: Ready
        - generic [ref=e132]:
          - heading "Step 0" [level=2] [ref=e133]:
            - generic [ref=e135]: Step 0
          - generic [ref=e136]:
            - generic [ref=e138]: Use a
            - code [ref=e141]: Map<string, number>
            - generic [ref=e143]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/0" [ref=e144] [cursor=pointer]:
              - /url: https://example.com/0
              - generic [ref=e146]: https://example.com/0
            - generic [ref=e148]: .
          - listitem [ref=e149]:
            - generic [ref=e151]: keep
            - strong [ref=e154]: order
          - listitem [ref=e155]:
            - generic [ref=e157]: avoid
            - emphasis [ref=e160]: churn
          - generic [ref=e162]:
            - generic [ref=e163]: ts
            - code [ref=e165]:
              - generic [ref=e166]:
                - generic [ref=e168]: const
                - generic [ref=e169]: m =
                - generic [ref=e171]: new
                - generic [ref=e174]: Map
                - generic [ref=e175]: <
                - generic [ref=e177]: string
                - generic [ref=e178]: ","
                - generic [ref=e180]: number
                - generic [ref=e181]: ">();"
          - heading "Step 1" [level=2] [ref=e182]:
            - generic [ref=e184]: Step 1
          - generic [ref=e185]:
            - generic [ref=e187]: Use a
            - code [ref=e190]: Map<string, number>
            - generic [ref=e192]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/1" [ref=e193] [cursor=pointer]:
              - /url: https://example.com/1
              - generic [ref=e195]: https://example.com/1
            - generic [ref=e197]: .
          - listitem [ref=e198]:
            - generic [ref=e200]: keep
            - strong [ref=e203]: order
          - listitem [ref=e204]:
            - generic [ref=e206]: avoid
            - emphasis [ref=e209]: churn
          - generic [ref=e211]:
            - generic [ref=e212]: ts
            - code [ref=e214]:
              - generic [ref=e215]:
                - generic [ref=e217]: const
                - generic [ref=e218]: m =
                - generic [ref=e220]: new
                - generic [ref=e223]: Map
                - generic [ref=e224]: <
                - generic [ref=e226]: string
                - generic [ref=e227]: ","
                - generic [ref=e229]: number
                - generic [ref=e230]: ">();"
          - heading "Step 2" [level=2] [ref=e231]:
            - generic [ref=e233]: Step 2
          - generic [ref=e234]:
            - generic [ref=e236]: Use a
            - code [ref=e239]: Map<string, number>
            - generic [ref=e241]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/2" [ref=e242] [cursor=pointer]:
              - /url: https://example.com/2
              - generic [ref=e244]: https://example.com/2
            - generic [ref=e246]: .
          - listitem [ref=e247]:
            - generic [ref=e249]: keep
            - strong [ref=e252]: order
          - listitem [ref=e253]:
            - generic [ref=e255]: avoid
            - emphasis [ref=e258]: churn
          - generic [ref=e260]:
            - generic [ref=e261]: ts
            - code [ref=e263]:
              - generic [ref=e264]:
                - generic [ref=e266]: const
                - generic [ref=e267]: m =
                - generic [ref=e269]: new
                - generic [ref=e272]: Map
                - generic [ref=e273]: <
                - generic [ref=e275]: string
                - generic [ref=e276]: ","
                - generic [ref=e278]: number
                - generic [ref=e279]: ">();"
          - heading "Step 3" [level=2] [ref=e280]:
            - generic [ref=e282]: Step 3
          - generic [ref=e283]:
            - generic [ref=e285]: Use a
            - code [ref=e288]: Map<string, number>
            - generic [ref=e290]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/3" [ref=e291] [cursor=pointer]:
              - /url: https://example.com/3
              - generic [ref=e293]: https://example.com/3
            - generic [ref=e295]: .
          - listitem [ref=e296]:
            - generic [ref=e298]: keep
            - strong [ref=e301]: order
          - listitem [ref=e302]:
            - generic [ref=e304]: avoid
            - emphasis [ref=e307]: churn
          - generic [ref=e309]:
            - generic [ref=e310]: ts
            - code [ref=e312]:
              - generic [ref=e313]:
                - generic [ref=e315]: const
                - generic [ref=e316]: m =
                - generic [ref=e318]: new
                - generic [ref=e321]: Map
                - generic [ref=e322]: <
                - generic [ref=e324]: string
                - generic [ref=e325]: ","
                - generic [ref=e327]: number
                - generic [ref=e328]: ">();"
          - heading "Step 4" [level=2] [ref=e329]:
            - generic [ref=e331]: Step 4
          - generic [ref=e332]:
            - generic [ref=e334]: Use a
            - code [ref=e337]: Map<string, number>
            - generic [ref=e339]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/4" [ref=e340] [cursor=pointer]:
              - /url: https://example.com/4
              - generic [ref=e342]: https://example.com/4
            - generic [ref=e344]: .
          - listitem [ref=e345]:
            - generic [ref=e347]: keep
            - strong [ref=e350]: order
          - listitem [ref=e351]:
            - generic [ref=e353]: avoid
            - emphasis [ref=e356]: churn
          - generic [ref=e358]:
            - generic [ref=e359]: ts
            - code [ref=e361]:
              - generic [ref=e362]:
                - generic [ref=e364]: const
                - generic [ref=e365]: m =
                - generic [ref=e367]: new
                - generic [ref=e370]: Map
                - generic [ref=e371]: <
                - generic [ref=e373]: string
                - generic [ref=e374]: ","
                - generic [ref=e376]: number
                - generic [ref=e377]: ">();"
          - heading "Step 5" [level=2] [ref=e378]:
            - generic [ref=e380]: Step 5
          - generic [ref=e381]:
            - generic [ref=e383]: Use a
            - code [ref=e386]: Map<string, number>
            - generic [ref=e388]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/5" [ref=e389] [cursor=pointer]:
              - /url: https://example.com/5
              - generic [ref=e391]: https://example.com/5
            - generic [ref=e393]: .
          - listitem [ref=e394]:
            - generic [ref=e396]: keep
            - strong [ref=e399]: order
          - listitem [ref=e400]:
            - generic [ref=e402]: avoid
            - emphasis [ref=e405]: churn
          - generic [ref=e407]:
            - generic [ref=e408]: ts
            - code [ref=e410]:
              - generic [ref=e411]:
                - generic [ref=e413]: const
                - generic [ref=e414]: m =
                - generic [ref=e416]: new
                - generic [ref=e419]: Map
                - generic [ref=e420]: <
                - generic [ref=e422]: string
                - generic [ref=e423]: ","
                - generic [ref=e425]: number
                - generic [ref=e426]: ">();"
          - heading "Step 6" [level=2] [ref=e427]:
            - generic [ref=e429]: Step 6
          - generic [ref=e430]:
            - generic [ref=e432]: Use a
            - code [ref=e435]: Map<string, number>
            - generic [ref=e437]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/6" [ref=e438] [cursor=pointer]:
              - /url: https://example.com/6
              - generic [ref=e440]: https://example.com/6
            - generic [ref=e442]: .
          - listitem [ref=e443]:
            - generic [ref=e445]: keep
            - strong [ref=e448]: order
          - listitem [ref=e449]:
            - generic [ref=e451]: avoid
            - emphasis [ref=e454]: churn
          - generic [ref=e456]:
            - generic [ref=e457]: ts
            - code [ref=e459]:
              - generic [ref=e460]:
                - generic [ref=e462]: const
                - generic [ref=e463]: m =
                - generic [ref=e465]: new
                - generic [ref=e468]: Map
                - generic [ref=e469]: <
                - generic [ref=e471]: string
                - generic [ref=e472]: ","
                - generic [ref=e474]: number
                - generic [ref=e475]: ">();"
          - heading "Step 7" [level=2] [ref=e476]:
            - generic [ref=e478]: Step 7
          - generic [ref=e479]:
            - generic [ref=e481]: Use a
            - code [ref=e484]: Map<string, number>
            - generic [ref=e486]: "or Map<string, number> for {key: value} lookups when x<y. See"
            - link "https://example.com/7" [ref=e487] [cursor=pointer]:
              - /url: https://example.com/7
              - generic [ref=e489]: https://example.com/7
            - generic [ref=e491]: .
          - listitem [ref=e492]:
            - generic [ref=e494]: keep
            - strong [ref=e497]: order
          - listitem [ref=e498]:
            - generic [ref=e500]: avoid
            - emphasis [ref=e503]: churn
          - generic [ref=e505]:
            - generic [ref=e506]: ts
            - code [ref=e508]:
              - generic [ref=e509]:
                - generic [ref=e511]: const
                - generic [ref=e512]: m =
                - generic [ref=e514]: new
                - generic [ref=e517]: Map
                - generic [ref=e518]: <
                - generic [ref=e520]: string
                - generic [ref=e521]: ","
                - generic [ref=e523]: number
                - generic [ref=e524]: ">();"
          - heading "Step 8" [level=2] [ref=e525]:
            - generic [ref=e527]: Step 8
          - generic [ref=e528]:
            - generic [ref=e530]: Use a
            - code [ref=e533]: Map<string, number>
            - generic [ref=e535]: or Map<string, nu
    - heading "Markdown Source" [level=2] [ref=e536]
    - textbox "Markdown source" [ref=e537]: "## Step 0 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/0>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 1 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/1>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 2 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/2>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 3 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/3>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 4 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/4>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 5 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/5>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 6 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/6>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 7 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/7>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 8 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/8>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 9 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/9>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 10 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/10>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 11 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/11>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 12 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/12>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 13 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/13>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 14 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/14>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 15 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/15>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 16 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/16>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 17 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/17>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 18 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/18>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 19 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/19>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 20 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/20>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 21 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/21>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 22 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/22>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 23 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/23>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 24 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/24>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 25 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/25>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 26 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/26>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 27 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/27>. - keep **order** - avoid _churn_ ```ts const m = new Map<string, number>(); ``` ## Step 28 Use a `Map<string, number>` or Map<string, number> for {key: value} lookups when x<y. See <https://e"
  - alert [ref=e538]
```

# Test source

```ts
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
  1238 |       expect(await outputText(page, mode)).toBe(streamed);
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
> 1280 |       expect(await outputText(page, mode)).toBe(streamed);
       |                                            ^ Error: expect(received).toBe(expected) // Object.is equality
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
  1339 |     );
  1340 |     await settle(page);
  1341 |     const fresh = await outputHTML(page, 'static');
  1342 | 
  1343 |     expect(await outputText(page, 'static')).toContain('Section C');
  1344 |     expect(streamed).toBe(fresh);
  1345 |   });
  1346 | 
  1347 |   test('AI preview renders the final document like a one-chunk response', async ({
  1348 |     browser,
  1349 |     baseURL,
  1350 |   }) => {
  1351 |     const streamed = await runAICorrectness(
  1352 |       browser,
  1353 |       baseURL!,
  1354 |       toChunks(REUSE_SOURCE, 16)
  1355 |     );
  1356 |     const whole = await runAICorrectness(browser, baseURL!, [REUSE_SOURCE]);
  1357 | 
  1358 |     expect(streamed.text).toBe(whole.text);
  1359 |     expect(streamed.html).toBe(whole.html);
  1360 |   });
  1361 | 
  1362 |   test('AI insert preview keeps registered tags hidden', async ({
  1363 |     browser,
  1364 |     baseURL,
  1365 |   }) => {
  1366 |     const source =
  1367 |       'paragraph\n\n<columnGroup>\n  <column width="50%">\n    1\n  </column>\n  <column width="50%">\n    2\n  </column>\n</columnGroup>\n\nparagraph';
  1368 |     const result = await runAICorrectness(
  1369 |       browser,
  1370 |       baseURL!,
  1371 |       toChunks(source, 7)
  1372 |     );
  1373 | 
  1374 |     for (const text of result.texts) expect(text).not.toMatch(/<\/?column/);
  1375 |     expect(result.text).toContain('1');
  1376 |   });
  1377 | });
  1378 | 
  1379 | // Acceptance cells first (10 KB, then 50 KB with the rich cells ahead of the
  1380 | // CJK ones), so the cost cap can only cut the most expensive cells; the live AI
```