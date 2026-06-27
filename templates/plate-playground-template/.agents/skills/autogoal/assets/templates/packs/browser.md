# browser pack

Use this pack when changed behavior has a real browser, route, UI, native browser/OS, visual, selection, interaction, console, or network surface.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser pack selected | pending | pending |
| Browser route / app surface identified | pending | pending |
| Browser tool decision recorded | pending | pending |
| Chrome/Computer decision recorded for native browser surface | pending | pending |

Work Checklist:
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used for native downloads, print/print-preview, file picker/uploads,
      clipboard, browser dialogs/permissions, extension/profile state, or exact
      Chrome rendering; Computer Use is used when native Chrome/OS UI needs
      visual confirmation.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: proof uses the real affected browser surface.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or N/A | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |
