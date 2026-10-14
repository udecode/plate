# 媒体 caption、预览和上传位置修复

Status: waiting，第 1 到 3 步和第 7 到 18 步已完成待你提交；第四个问题等你告诉我浏览器和点击位置
Playbook: plan
Page: https://claude.ai/artifact/8gg8thJeiuxWu1YD67QW1U

## Brief

### What will change?

三个问题修好了：选中媒体不再弹出空 caption，空段落里上传会替换它，双击能打开预览。另外按你后来说的，方向键不再进入空 caption，只有 caption 有文字时才会经过它。编辑时单击文件只会选中它，双击才打开；文件、视频、音频选中后会出现和图片一样的工具栏，可以从那里加 caption 或点 Preview 预览。图片的工具栏也多了 Preview，效果和双击一样。第四个问题在三种浏览器里都复现不出来，还开着。改动没有提交。

### What could go wrong?

文件放在别的域名上时，Preview 和双击会在新标签页里显示文件，而不是下载它；真正下载要服务端配合，这次没做。线上 playground 的预览只用单元测试确认过，没在生产构建里实际点过。WebKit 里一个上传测试本来就失败，和这次改动无关。

## Teach

一个媒体块，比如图片，分两部分。图片本身放不了光标。图片下面的 caption 是普通文字，光标可以进去。

现在点一下图片，空的 caption 框也会显示出来，页面因此往下跳约 32 像素。方向键也会在看不见的空 caption 里停一下，让它突然冒出来。图片按钮上传时，总是把图片放到当前段落后面，哪怕这个段落是空的。双击时还没打开预览就报错了，原因是图片交给预览的是一个编辑器认不出来的自身副本。单击文件块会同时选中它并打开新标签页，所以没法只选中文件去删除或移动。

修完以后，空 caption 只在光标在它里面时才显示，和旧版一样。方向键跳过空 caption，选中媒体后再按下箭头会到下一段，从下一段往回按会选中媒体本身；caption 有文字时照旧经过它。单击文件只选中它，双击才打开。要写 caption，点浮出工具栏的 Caption 按钮，文件、视频、音频现在也有这个工具栏。在光标处上传会替换空段落，和粘贴的行为一致。图片先按自己的位置拿到 id，再打开预览。

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| 空 caption 什么时候显示 | 只在光标在里面或已有文字时显示 | 像现在一样，选中媒体就显示 | caption on select | big |
| caption 改动覆盖哪些媒体 | 全部五种媒体 | 只改图片 | images only | small |
| 空段落替换对谁生效 | 所有应用，改在上传插件里 | 只改图片工具栏按钮 | button only | small |
| 拖放文件 | 保持不变，由拖放提示线决定位置 | 拖到空段落上就替换它 | drop replaces | detail |
| 评审 | fast 模式，不跑多模型评审 | 对改动做完整评审 | full | small |
| 线上 playground 的预览验证 | 用单元测试确认浏览器上传套件不会覆盖掉预览 (look) | 在生产构建的 playground 里实际双击 | prod preview | small |
| 预览测试拦哪些报错 | 只拦页面报错和已知的编辑器报错 (look) | 拦所有控制台报错，WebKit 会因外部图片跨域报错而失败 | strict errors | detail |
| 方向键跳过空 caption 改在哪一层 | 改在编辑器底层 plitejs 的方向键处理里，所有媒体都跳过空 caption (look) | 只在 Plate 的媒体组件里自己处理方向键 | media keys only | small |
| 视频、音频、文件的空 caption 怎么进入 | 按你回复的 "file click select all"，选中时显示媒体工具栏，用上面的 Caption 按钮进入 | 不加入口 | no caption button | big |
| 工具栏的 Preview 按钮给哪些媒体 | 按你说的，图片、文件、视频、音频都有；嵌入保持原样 (look) | 嵌入也加 Preview | embed preview | small |

## Scope

这个计划要改：`apps/www/src/registry/components/editor/` 下复制给用户的媒体组件、`caption.tsx` 和 `media-preview-dialog.tsx`；`packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts` 里的 `BaseUploadPlugin.submit`；以及描述这些行为的文档页。不改：工作区里已有的本地 `fs` 网关改动、拖放文件的落点规则、静态渲染组件。

## Decisions

- **caption 的显示逻辑收进 `Caption` 组件。** 五个媒体组件（`media-image.tsx:102`、`media-video.tsx:171`、`media-audio.tsx:51`、`media-file.tsx:52`、`media-embed.tsx:161`）都传 `active={selected || captionFocused}`，而且各自调用一次 `useCaptionFocused(path)`。`Caption` 自己就拿得到路径，所以改成由它自己判断光标是否在 caption 里，删掉 `active` 这个 prop。空 caption 只有在选区落在它里面时才显示。这和 `main` 一致：那时 caption 输入框在没有文字、也没点 caption 按钮时一直是隐藏的。`CaptionButton` 本来就会把光标放到 caption 开头，所以点它仍然能打开空 caption。
- **在选区处 `submit` 会替换空块。** `media-toolbar-button.tsx:105` 调用 `upload.update.submit(updatedFiles)` 时没传位置，最后走到 `tx.blocks.insertAfter`，`replaceEmpty` 为 false（`packages/plitejs/src/core/public-state.ts:5436`）。粘贴那条路已经传了 `replaceEmpty: true`（`BaseUploadPlugin.ts:895`，`insertData` 拦截器）。修法是在 `BaseUploadPlugin` 里规定：没有传 `slot`、`before`、`at` 或 `after` 时，默认 `replaceEmpty: true`。这样文件选择器和粘贴行为一致，所有复制了这套代码的应用都会跟着修好。显式传了的选项含义不变。这是 `submit` 公开行为的变化，所以收尾前要跑 `best-api repair`。
- **预览改用节点 key 打开。** `ImageElement` 调用 `api.preview.open(props.element, url)`，`open` 里再调 `editor.key(element)`，浏览器里会抛出 `Node key requires a live node in this editor`（见 `findings.md`）。从这个报错推断，渲染时拿到的 `props.element` 不是编辑器里真实的节点对象。第 3 步的用例在 HEAD 上正是因为这个报错失败（`base-browser-a1.log`）。改成 `open` 接收图片的 `NodeKey`，`ImageElement` 按路径拿 key，做法和 `UploadElement` 的 `usePath((path) => editor.key(path))` 一样。
- **第四个问题先复现再修。** 在 Chromium 和 WebKit 里，单击有 caption 的图片的五个位置，选中的都是图片节点（见 `findings.md`）。第一个要验证的猜测是：第三个问题里的双击，触发了浏览器默认的选词，选中了 caption 的文字。有失败用例之前不动代码。

## Steps

- [x] 1. 空 caption 默认隐藏，只在光标在里面时显示。把光标判断收进 `Caption`，五个媒体组件删掉 `active`，修好 `caption.spec.tsx` 和传了这个 prop 的媒体测试。通过 `plate-docs` 更新 `content/docs/(plugins)/(elements)/media.mdx` 第 254 行那一行（写着选中媒体会显示空 caption 的占位文字）以及对应的中文页。证明：在 `apps/www/tests/browser/` 新加一个用例，在 `/blocks/playground` 上传一张图并点击它，断言图片块高度不变、caption 仍然隐藏；接着按 `ArrowDown`，光标进入 caption，caption 显示出来，输入的文字落在 caption 里；点 caption 按钮能打开空 caption。这个用例要先在 `HEAD` 上失败，再用 `PLAYWRIGHT_BASE_URL=<检查过的地址> pnpm --filter www test:www-browser:chromium` 连续热跑五次通过；点击后的前后截图要打开看过。
  - 完成：`docs/plans/artifacts/2026-10-13-media-upload-ux/final4-chromium-a1.log` 到 `final4-chromium-a5.log`（第 8 步之后的最终代码），`base-browser-a1.log`，截图 `caption-head-after-click.png` 和 `caption-fix-after-click.png`。实际做法和计划的差别：只把显示判断移进 `Caption` 不够，`editor.read.selection()` 会把图片的节点选区读成 caption 开头的光标（`probe-caption-dbg.out.md`），所以 `useCaptionFocused` 还要在有节点选区时返回 false。上传图片的用例改成用 caption 按钮打开空 caption。第 7 步让方向键跳过空 caption 以后，上面“按 `ArrowDown` 光标进入 caption”这一条不再成立，`media-caption-delete.spec.ts` 的两个用例改成用 Caption 按钮或直接设选区进入空 caption，这两个用例原来写的是旧行为，已改。截图来自 `/blocks/media-demo` 的视频块，不是上传的图片。
- [x] 2. 在选区处 `submit` 时替换空块。在 `BaseUploadPlugin.ts` 里，没传位置参数时 `replaceEmpty` 默认为 true。证明：`BaseUploadPlugin.spec.ts` 新增几个先在 `HEAD` 上失败的用例：光标在空段落里时，结果是原段落位置上只剩一个上传草稿，空段落没了；段落非空时，原文字保留，草稿放在它后面；显式传 `{ after }` 且不传 `replaceEmpty` 时，仍然插在后面。再加一个浏览器用例：点进一个空段落，用图片工具栏的文件选择器上传，断言空段落消失、图片出现在它原来的位置。通过 `plate-docs` 更新 `content/docs/(guides)/upload.mdx` 和中文页，按 `changeset` 的要求给 `platejs` 加 changeset，并对 `submit` 的新默认值跑 `best-api repair`。
  - 完成：`base-upload-lifecycle-a1.log`（HEAD 上失败）、`unit-final-a2.log`、`final4-chromium-a1.log` 到 `a5`；changeset 并进了还没发布的 `.changeset/files-sdk-uploads.md`；`best-api repair` 在 `docs/vision/plate.md` 的上传段落加了一句，说明在选区处上传沿用元素 `insert` 的空块规则。计划里写的 `BaseUploadPlugin.spec.ts` 实际放进了 `BaseUploadPlugin.lifecycle.spec.ts`，那里已有其他位置相关用例；第三个子用例（显式 `{ after }`）没单独写，因为原有用例已覆盖。
- [x] 3. 预览按 key 打开。把 `imagePlugin.api.preview.open` 改成接收 `NodeKey` 和 URL，由 `ImageElement` 传进来。证明：一个浏览器用例在 `/blocks/playground` 双击图片，断言预览层显示出来，并且在 `recordBrowserRuntimeErrors(page, { strict: true })` 下没有页面报错，按 Escape 能关掉。这个用例要先在 `HEAD` 上失败，报错是 `Node key requires a live node`。另外用 `createBrowserUploadKit()` 渲染一次 playground：线上环境里它会在 `MediaKit` 之后重新配置 `ImagePlugin`（`upload/browser.ts:102`），要确认那里预览也能打开；如果这次重新配置把预览扩展覆盖掉了，就在这一步一起修。
  - 完成：`base-browser-a1.log`（HEAD 上失败）、`final4-chromium-a1.log` 到 `a5`、`accept-webkit-preview-a1.log` 到 `a5`、`probe-kit-override-a1.log`。和计划的差别：报错捕获改成默认模式，因为严格模式在 WebKit 里会因 playground 外部图片的跨域报错失败（`accept-webkit-a1.log`）；线上上传套件只用单元探针验证了后配置不会覆盖预览，没在生产构建里实际点，见 Defaults。
- [ ] 4. 点击有 caption 的图片时选中图片本身。先复现：双击 playground 里有 caption 的图片，读出 DOM 选区和编辑器选区。复现出来后，在根因所在的地方修，并加一个浏览器用例：单击和双击有 caption 的图片，断言选中的是图片节点，DOM 选区不在 `figcaption` 里，在 Chromium 和 WebKit 各热跑五次。复现不出来的话，这一步保持未完成，等你提供浏览器和点击位置。owner: felixfeng. stop: 有了失败用例，或到 2026-10-20。
- [x] 5. 对产品代码改动跑 `deslop`。`no-comments` 按 fast 模式记为 `skip: fast`。然后对改过的文件跑 `pnpm lint:task`。证明：`deslop` 的调用记录和干净的 `lint:task` 日志。
  - 完成：本次运行调用了 `pstack:deslop`，`no-comments` 记为 skip: fast；`lint-task-a2.log` 通过。
- [x] 6. 最后一次改动之后，重跑受影响的已有用例：`caption.spec.tsx`、`media-image.spec.tsx`、`media-video.spec.tsx`、`media-file.spec.tsx`、`media-preview-dialog.spec.tsx`、`media-toolbar.spec.tsx`、`upload.spec.tsx`、`upload.lifecycle.spec.tsx`、各个 `BaseUploadPlugin*.spec.ts`，以及 `apps/www/tests/browser/files-sdk.spec.ts` 和 `clipboard-upload.spec.ts`。证明：每个测试命令一份日志，带退出码那一行，放在本次运行目录里。
  - 完成：`unit-final-a2.log`（逐文件跑，全部通过）和 `final-suites-a1.log`（25 个浏览器用例通过）。`media-file.spec.tsx`、`media-video.spec.tsx` 的 mock 补了 `selection.nodes`。
- [x] 7. 方向键跳过空 caption。这是 build 之后你加的要求："按下下箭头的的时候也不要focs caption，只有caption有内容的时候 才会经过他"。在 plitejs 的 `caret-engine.ts` 里，选中媒体后按下箭头或右箭头，caption 为空就直接到下一个块；从下一个块按上箭头或左箭头回来，选中的是媒体本身。caption 有文字时行为不变。通过 `plate-docs` 更新 `media.mdx` 和中文页，同步改行为规范 `EDIT-CAPTION-NAV-001`、`003`、`004`、`006`，给 `plitejs` 加 changeset。证明：`media-caption.spec.ts` 里文件、音频、视频三个 "arrow keys skip an empty ${mediaType} caption" 用例在改 `caret-engine.ts` 之前失败、改后通过；去掉任一方向的跳过逻辑，用例都会失败；受影响的浏览器套件在 Chromium 连续热跑五次通过；plitejs 的 object-selection 测试和类型检查通过。
  - 完成：`base-arrow-skip-a1.log`（改前失败）、`fix-arrow-skip-a1.log`、`mutant-reverse-a1.log`、`mutant-forward-a1.log`、`final4-chromium-a1.log` 到 `final4-chromium-a5.log`、`plite-object-selection-a2.log`、`plite-typecheck-force-a1.log`、`lint-task-arrow-a1-a1.log`。plitejs 整套 react 测试跑了一次，1445 个里有一个 IME 用例失败，单独重跑两次都通过，判断是偶发失败，记在决策日志里。
- [x] 8. 文件、视频、音频的点击和工具栏。这是你回复的 "file click select all"。编辑模式下，单击文件块只选中它，双击才在新标签页打开；只读模式下单击仍按链接打开。文件、视频、音频被选中时显示媒体工具栏，和图片一样有 Edit link、Caption 和删除，另外多一个 Open 链接。通过 `plate-docs` 更新 `media.mdx` 的 Registry media UI 一节和中文页，更新还没发布的 registry changelog 条目。证明：`apps/www/tests/browser/media-select.spec.ts` 新加两组用例。第一组在 `/blocks/media-demo` 单击文件块，断言选中的是文件节点、工具栏出现，再双击，断言打开了一个指向文件地址的新页面，而且整个过程只开了这一个页面。第二组对文件、视频、音频，从下一段按上箭头选中媒体，点工具栏的 Caption，断言 caption 显示出来，输入的文字落在 caption 里。`media-file.spec.tsx` 加一个用例：只读模式下单击文件链接不被拦截。新用例先在改动前失败，再在 Chromium 连续热跑五次通过。
  - 完成：`base-media-select-a1.log`（改动前四个用例都失败）、`final4-chromium-a1.log` 到 `final4-chromium-a5.log`（新旧 31 个用例五次全过）、`unit-step8-a2.log`、`mutate/drop-read-only-guard-a1.log`（去掉只读判断后单元用例失败）、`typecheck-www-step8-a1.log`（22 个错误和改动前完全相同，都不在改动文件里）、`lint-task-step8-a1.log`、`build-registry-step8-check-a1.log`、`registry-changelog-step8-a1.log`。和计划的差别：Caption 用例要先把媒体滚进视口，因为方向键选中视频时页面不会跟着滚，这和 HEAD 上就失败的 node-selection 滚动用例是同一个问题；单击和双击两个判断没有跑浏览器变异体，只做了推理，见 `step8-mutant-gap.md`。`media-video.spec.tsx` 补了 `media-toolbar` 的 mock。
- [x] 9. 工具栏的 Open 改成 Preview，图片也加一个 Preview。这是你说的 "Open 改为 Preview 同样 也给 Image 加一个Preview"。`MediaToolbar` 去掉 `openable`，改成可选的 `onPreview`，传了才显示 Preview 按钮。图片的 Preview 打开 `media-preview-dialog`，和双击一样；文件、视频、音频的 Preview 在新标签页打开文件。同步更新 `media.mdx` 和中文页、registry changelog 条目。证明：`media-select.spec.ts` 的文件用例改成点 Preview 打开一个指向文件地址的新页面，双击再打开一个，单击本身不打开；`media-preview.spec.ts` 新加一个用例，单击图片后点工具栏的 Preview，预览层出现。新断言先在改动前失败，再在 Chromium 连续热跑五次通过。
  - 完成：`base-preview-button-a1.log`（改前两个用例都失败）、`fix-preview-button-a1.log`（6 个用例通过）、`final5-chromium-a1.log` 到 `final5-chromium-a5.log`、`unit-step9-a1.log`、`lint-task-step9-a1.log`、`build-registry-step9-check-a1.log`。五次最终运行里有两次各挂了一个和本步无关的用例：一次是测试工具设置 DOM 选区超时（图片方向键用例），一次是公式弹窗按钮在视口外（block-void 用例）。这两个用例单独重跑 5 次全过（`flake-check-step9-a1.log`），判断是偶发失败，没在 HEAD 上核对。
- [x] 10. 图片预览居中，Esc 和点遮罩都能关闭。这是你说的 "Image的 preview 效果很差，需要支持 esc / 点击遮罩层 关闭，且图片位置需要剧中"。原因：图片外面那层容器铺满整个屏幕，把遮罩按钮整个盖住了，所以点遮罩没反应；图片按钮没有在那一行里居中，所以图片偏左。修法：外层容器不接收点击，只有图片和底部按钮接收；那一行加上居中；Esc 改在捕获阶段监听，编辑器或弹层的处理器拦不住它。证明：`media-preview.spec.ts` 新加两个用例，从工具栏打开预览后图片中心和视口中心相差不超过 1 像素、点一下图片再按 Esc 能关闭，以及点遮罩左上角能关闭。
  - 完成：`base-preview-dialog-a1.log`（改前图片中心偏 340 像素、点遮罩不关闭）、`fix-preview-dialog-a1.log`、`final6-chromium-a1.log` 到 `final6-chromium-a5.log`（预览、文件选择和 caption 删除三个文件共 10 个用例五次全过）。改前 Esc 在 Chromium 里其实能关闭，改成捕获阶段是防御，不是复现出来的修复；居中只量了几何位置，没有截图检查。
- [x] 11. 预览层盖住整个页面，计数显示正确。这是你截图说的 "图层不对吧"。原因有两个。一是预览框渲染在编辑器里面，首页编辑器外层有一个 `z-10` 的层叠上下文，所以顶部导航和底部的渐变遮罩都盖在预览上面；现在预览通过 portal 渲染到 `document.body`。二是预览的计数一直显示 0：图片按视图编辑器拿 key，预览列表按插件所属的编辑器拿 key，两个编辑器的 key 不通用，所以当前图片在列表里找不到；现在图片传路径，由插件那边的编辑器统一取 key，`api.preview.open` 的参数从 key 改成了路径。证明：`media-preview.spec.ts` 新加一个首页用例，打开预览后视口左上、左下和右侧的点都落在预览遮罩上，计数不是 0；双击用例也检查计数。
  - 完成：`base-preview-layer-a1.log` 和截图 `base-preview-layer-a1/home.png`（改前顶部导航和底部渐变盖住预览，计数为 0）、`fix-preview-layer-a1/home.png`（portal 之后导航和渐变被遮住）、`fix-preview-layer-a3.log`（5 个预览用例通过）、`final8-chromium-a1.log` 到 `final8-chromium-a5.log`。这推翻了第 3 步"按 key 打开"的做法：按 key 打开能打开预览，但计数一直是 0，这次一并修了。
- [x] 12. 预览底部工具栏改用现有的 `Button` 和 `Separator`。这是你说的 "这个toolbar的UI 优化一下 尽量用现有的button组件"。工具栏改成和其他浮层一样的白底圆角条，按钮都是 ghost 的 `Button`，计数显示成 "1 / 1"，三组按钮之间用竖线隔开，固定在屏幕底部，不再压在图片上。删掉了本文件自己的 `cva` 按钮样式。
  - 完成：截图 `preview-toolbar-3.png` 打开看过，按钮、计数和分隔线都正常显示；`final8-chromium-a1.log` 到 `final8-chromium-a5.log` 里预览相关用例五次全过。第 1 次运行里 "arrow keys traverse the image owner before its caption" 又一次在测试工具设置光标时超时，和第 9 步那次一样，单独重跑能过，记在 Open work。
- [x] 13. 音频选中框去掉多余留白，文件和音频的工具栏不再盖住下一个块。这是你说的 "这个留白能去掉吗" 和 "但又出现了 这样的ui问题"。音频外层原来固定 64 像素高，播放器只有 54 像素，选中框上方就空出一截；现在外层跟着播放器高度走，选中框是贴合播放器的圆角。`MediaToolbar` 加了 `placement`：文件用 `inline`，工具栏放在文件那一行里的右侧；音频用 `top`，工具栏放在播放器上方右侧；图片、视频、嵌入保持在下方。静态渲染的音频组件同步去掉了固定高度。
  - 完成：截图 `audio-selected.png` 和 `file-selected-6.png` 打开看过，音频选中框贴合播放器，文件工具栏在自己那一行里，都没盖住相邻的块；`final9-chromium-a1.log` 到 `final9-chromium-a5.log`（24 个用例五次全过）、`unit-step13-a1.log`、`typecheck-www-step13-a1.log`（错误和改动前相同）、`lint-task-step13-a1.log`、`build-registry-step13-check-a1.log`。`inline` 的位置靠固定偏移量（-38 像素）贴进文件那一行，只在默认字号下看过。
- [x] 14. 文件工具栏不再像框里套框。这是你说的 "视觉上还是有点重复"。选中的文件行有一圈选中框，里面的工具栏又带白底、边框和阴影，看起来是两层框。现在 `inline` 工具栏去掉背景、边框和阴影，按钮直接平铺在选中行的右侧，偏移量改成 -35 像素让按钮在行里垂直居中。文件行选中时右侧留出工具栏的宽度，长文件名会截断成省略号，不会和按钮重叠。
  - 完成：截图 `file-selected-10.png`（短文件名）和 `file-selected-11-long.png`（长文件名）打开看过，只剩一层选中框，按钮和行居中对齐（中心差 0.16 像素），长文件名在 658 像素处截断，按钮从 673 像素开始；`step14-select-a1.log` 到 `step14-select-a5.log`（4 个用例五次全过）、`step14-unit-a2.log`、`typecheck-www-step14-a1.log`（错误和改动前相同）、`lint-task-step14-a1.log`、`build-registry-step14-check-a1.log`、`changelog-check-step14-a1.log`。长文件名是在浏览器里直接改显示文字模拟的，没用真实的长文件名文档。
- [x] 15. 文件的选中框不再压到下面的音频。这是你说的 "边框还是和 audio 重合了"。选中框画在文件行外面 4 像素，可文件块和音频块之间原来只有 1 像素左右的间距，所以选中框压到了音频播放器上；音频选中时也会压到上面的文件。现在文件块和音频块上下各留 4 像素，选中框和相邻块之间空出 4 像素。文件行变高后，行内工具栏的偏移量改成 -39 像素，按钮保持居中。之前几步的截图都是在 `/blocks/media-demo` 上截的，那里文件下面没有音频，所以一直没发现这个问题；这一步改在 `/blocks/playground-demo` 上验证，顺序和你截图里一样，是图片、文件、音频。
  - 完成：在你 3000 端口的服务上截图 `home-file-e-selected.png` 和 `home-file-e-audio-selected.png` 并打开看过。文件选中时选中框底边在 473 像素，音频顶边在 477 像素；音频选中时选中框顶边在 473 像素，文件行底边在 469 像素；按钮中心和行中心差 0.4 像素。`step15-select-a1.log` 到 `step15-select-a5.log`（4 个用例五次全过，跑在 3000 端口），`step15-unit-a1.log`，`typecheck-www-step15-a1.log`（错误和改动前相同），`lint-task-step15-a2.log`，`build-registry-step15-check-a1.log`，`changelog-check-step15-a1.log`。音频的工具栏在播放器上方靠右，会盖住文件行右侧的空白处。
- [x] 16. 按下箭头时选区不动、音频外面出现奇怪的方框。这是你说的 "有时候 偶尔会出现这个问题我按下 下箭头的时候 selection好像没跟着移动，而是出现了一个奇怪的边框"。原因是点了音频播放器（播放键、进度条或边上）以后，浏览器把焦点交给了原生播放器，可编辑器的选区还停在文件上。焦点仍在编辑器内部，所以文件的选中框和工具栏照旧显示；下箭头被播放器接走，选区不动；那个灰色方框是播放器自己的焦点框。视频的原生播放器也一样。另一个能复现的入口是点工具栏的 Preview，焦点会停在按钮上，下箭头同样没反应。现在点音频或视频播放器会选中这个块，并把键盘焦点还给编辑器，播放照常；Preview 按钮不再抢焦点。
  - 完成：在你 3000 端口上复现了截图里的样子（`toolbar-keys-audiofocus.png`），改完后点播放键、进度条、边上三处都会选中音频，焦点回到编辑器，下箭头移到下一个块，播放没受影响（`probe-toolbar-keys-audioclick` 的 fix4 输出）。`media-select.spec.ts` 加了音频和视频播放器点击的用例，Preview 用例加了焦点断言；把三处修复分别去掉后这三个用例都失败（`step16-mutant-a1.log`）。`step16-final-a1.log` 到 `a5`（media-select 和 media-preview 共 11 个用例五次全过，跑在 3000 端口），`step16-unit-a1.log`，`typecheck-www-step16-a1.log`（错误和改动前相同），`lint-task-step16-a1.log`，`build-registry-step16-check-a1.log`，`changelog-check-step16-a1.log`。拖动进度条快进在无头浏览器里改前改后都拖不动，所以这一点没验证到。
- [x] 17. 点文件和音频中间的空白不再打开 caption。这是你说的 "为什么点击他俩中间会调出 caption呢"。第 15 步加的上下间距放在了块本身上，那块地方是可编辑的，浏览器就把光标放进离得最近的文字，也就是空 caption，caption 于是显示出来。现在间距放进了不可编辑的那层包裹里，点到间距等于点到文件或音频本身，会选中这个块，caption 保持隐藏。图片和视频的上下间距也放在块本身上，点它们的空白同样会进 caption；这是改动前就有的，这一步没改。
  - 完成：在你 3000 端口上点文件底部间距、两块正中间、音频顶部间距，都选中对应的块，caption 都不显示（`probe-gap-click-fix-c.log`，改前见 `probe-gap-click-base.log`）。`media-select.spec.ts` 加了文件和音频点间距的用例，把间距放回块本身后两个用例都失败（`step17-mutant-a2.log`）。
- [x] 18. 文件工具栏改回和其他媒体一样的通用浮动工具栏。这是你说的 "这个没有用通用的 组件吗"，图片和视频的工具栏都在块的上面或下面。第 14 步给文件做的行内平铺按钮删掉了，`MediaToolbar` 只剩 `bottom` 和 `top` 两种位置；文件和音频用 `top`，工具栏浮在块上方右侧，图片、视频、嵌入在下方。文件行为了给按钮让位做的截断和右侧留白也一起去掉了。浮在上方的工具栏会盖住上一个块右侧的一小段，比如截图里图片 caption 的末尾，这和图片工具栏盖住下一个块是同一类取舍。
  - 完成：截图 `home-file-g-selected.png` 打开看过，文件工具栏是通用样式，浮在文件行上方右侧，没盖住下面的音频；`step18-final-a1.log` 到 `a5`（media-select、media-preview、media-caption 共 26 个用例五次全过，跑在 3000 端口），`step18-unit-a1.log`，`typecheck-www-step18-a1.log`（错误和改动前相同），`lint-task-step18-a1.log`，`build-registry-step18-check-a1.log`，`changelog-check-step18-a1.log`。第 17 步之后的第一轮五次运行（`step17-final-a2.log`、`a4`）里视频播放器用例失败两次：一次是外链视频没加载出来，一次是点击位置在视频尺寸变化前算好；改成按元素点击后五次全过。

## Proof

每一步的证明写在它自己的勾选框里。目前的复现来自在你本机 dev server 上跑的临时脚本，记录在 `docs/plans/artifacts/2026-10-13-media-upload-ux/findings.md`。它们只用来定位问题，不能代替上面各步要加的仓库测试。实现按 Build playbook 执行。

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| `pstack:blast-radius` before code | yes | skip: fast; 用 `git grep` 普查调用点，不传位置的 `submit` 只有 `media-toolbar-button.tsx` 一处，`preview.open` 只有 `media-image.tsx` 一处 |
| `plate-docs` on named pages | yes | 本次运行调用了 `plate-docs`；改了 `media.mdx`、`upload.mdx` 和两份中文页 |
| `pnpm check` steps the edits reach | yes | `check-registry-changelog-a1.log` 通过；`build-registry-check-a3.log` 通过；`typecheck-platejs-a1.log` 通过；`typecheck-www-a1.log` 的错误都不在改动文件里；`check-knowledge-a1.log` 只报了没改过的 `docs/plans/topics/emoji.md` |
| thermo-nuclear code quality review | yes | skip: fast，会派子代理 |
| `best-api repair` | yes | 本次运行调用了 `best-api`；`docs/vision/plate.md` 加一句；`teaching-sweep.mjs` 没找到还在教旧调用的地方 |
| freeze each slice | no | skip: 单人串行，没有评审或配对运行读冻结的树 |
| changeset | yes | `.changeset/files-sdk-uploads.md` 加了一条；新增 `.changeset/plite-empty-object-text-arrows.md`；registry changelog `2026-10-13-media-caption-preview` |
| writing passes | yes | `deslop` 已跑；`no-comments` skip: fast；文档和本计划跑了 `unslop` |
| last check `pnpm lint:task` | yes | `lint-task-a2.log` 通过；第 7 步之后 `lint-task-arrow-a1-a1.log` 通过 |
| `check-plate-feature.mjs` | no | skip: 这不是 feature-delivery 计划 |

## Demo

1. 先用 `PLATE_WWW_DEV_SOURCE=1` 重启 www 的 dev server，或重新构建 `platejs`，因为空段落替换改在包里，你现在 3000 端口的 server 读的是旧的构建产物。然后打开 http://localhost:3000/blocks/playground ，在标题末尾按回车得到一个空段落，点工具栏的图片按钮选一张图。图片会出现在原来空段落的位置，空段落不会留下。
2. 点一下刚上传的图片。图片出现选中框，下面不会冒出空的 "Write a caption..."，页面不跳。
3. 选中图片后点浮出工具栏里的 Caption 按钮。这时 caption 才出现，可以直接输入。
4. 双击页面里 "Images with captions provide context." 那张图片。预览会打开，按 Esc 关闭后图片仍是选中状态。
5. 打开 http://localhost:3000/blocks/media-demo ，点一下没有 caption 的文件块。文件块被选中，浮出工具栏，不会打开新标签页。按下箭头，光标直接到下一段，不会停在空 caption 里。再按左箭头，文件块重新被选中。
6. 双击文件块，或选中后点工具栏的 Preview，文件在新标签页打开。点一下图片再点工具栏的 Preview，图片预览框打开。点一下视频，再点浮出工具栏里的 Caption，视频下面出现 caption，可以直接输入。

![before](artifacts/2026-10-13-media-upload-ux/caption-head-after-click.png)
![after](artifacts/2026-10-13-media-upload-ux/caption-fix-after-click.png)

## Public API

预览接口改成接收图片的路径，而不是节点对象。

```ts before
// apps/www/src/registry/components/editor/media-image.tsx
editor.plugin(imagePlugin).api.preview.open(props.element, props.element.url);
```

```ts after
// apps/www/src/registry/components/editor/media-image.tsx
editor.plugin(imagePlugin).api.preview.open(path, props.element.url);
```

`Caption` 不再接收 `active`，自己判断光标是否在 caption 里。

```tsx before
// apps/www/src/registry/components/editor/media-image.tsx
<Caption active={selected || captionFocused} align={textAlign} element={props.element} slots={props.slots}>
```

```tsx after
// apps/www/src/registry/components/editor/media-image.tsx
<Caption align={textAlign} element={props.element} slots={props.slots}>
```

文件、音频和视频也包进 `MediaToolbar`。新的可选 `onPreview` 让工具栏多一个 Preview 按钮，图片传入打开预览框的函数，其他媒体传入在新标签页打开文件的函数。

```tsx before
// apps/www/src/registry/components/editor/media-file.tsx
<EditorElement {...props} attributes={{ ...props.attributes, 'data-node-selection-highlight': 'self' }} className="my-px rounded-sm">
```

```tsx after
// apps/www/src/registry/components/editor/media-file.tsx
<MediaToolbar onPreview={() => { window.open(props.element.url, '_blank', 'noopener,noreferrer'); }} plugin={FilePlugin} selected={selected}>
```

## Main changes

- `useCaptionFocused` 在有节点选区时返回 false，因为 `editor.read.selection()` 会把媒体的节点选区读成 caption 开头的光标。
- `BaseUploadPlugin.submit` 不传位置时，`replaceEmpty` 默认为 true；结构块的保护（例如 details 的 summary）也对选区所在块生效。
- plitejs 的 `caret-engine.ts` 里，方向键遇到文字为空的 object 时不进入它的文字。从选中的 object 往前按会离开它，从后面往回按会选中它。往前按进入另一个 object 时，先选中那个 object，再进它的 caption。

## Close

偏差先说。第 1 步只靠把显示判断移进 `Caption` 不够，根因是 `editor.read.selection()` 把节点选区读成 caption 开头的光标，所以还改了 `useCaptionFocused`。第 7 步是 build 之后你加的要求，它推翻了第 1 步里"按 `ArrowDown` 进入空 caption"那一条，空 caption 改由工具栏的 Caption 按钮进入。第 8 步按你的 "file click select all" 给文件、视频、音频加了这个工具栏。第 3 步的两处证明变窄了：报错捕获从严格模式改成默认模式；线上浏览器上传套件只用单元探针验证，没在生产构建里点。第 8 步单击和双击的两个判断没有跑浏览器变异体，只做了推理（`step8-mutant-gap.md`）；只读模式下单击打开文件只在单元测试里证明。这些都记在 Defaults 或决策日志里。计划之外还改了：`media-caption-delete.spec.ts` 的两个用例（它们写的是旧行为）、`docs/editor-behavior/markdown-editing-spec.md` 里空 caption 的显示和方向键规则、`current-evidence.md` 的对应证据，以及 `docs/vision/plate.md` 的上传段落。

这次落地的是五件事，第五件在第 8、9 步。空 caption 在选中媒体时保持隐藏，五种媒体都生效。`BaseUploadPlugin.submit` 不传位置时替换选区所在的空块。双击图片能打开预览，预览盖在整个页面上，图片居中，计数正确，底部工具栏用现有按钮组件，点遮罩或按 Esc 都能关闭，关闭后图片保持选中。方向键跳过空 caption，有文字的 caption 照旧经过。编辑时单击文件只选中它，双击才打开，文件、视频、音频选中时显示带 Preview 和 Caption 的媒体工具栏，图片的工具栏也多了 Preview。最终证明是在最后的代码上，受影响的七个浏览器测试文件在 Chromium 连续热跑五次，第 9 步之后的五次里 32 个用例有三次全过，另外两次各有一个无关用例偶发失败、单独重跑全过（`final5-chromium-a1.log` 到 `a5`，`flake-check-step9-a1.log`），另有 WebKit 预览五次热跑和单元测试，都在 `docs/plans/artifacts/2026-10-13-media-upload-ux/`。证明有几处边界。WebKit 预览、上传相关的单元测试和 `clipboard-upload.spec.ts` 跑在第 7、8 步之前；这两步没改预览和上传代码，所以推断仍然成立，没重跑。上传图片的 R2 用例在 WebKit 里 HEAD 上就失败（网关 mock 拿不到请求体，`base-webkit-r2-a1.log`），所以那条只证明 Chromium。`node-selection-input.spec.ts` 的 "ArrowDown scrolls each newly selected block into view" 在 HEAD 上同样失败（`base-node-selection-a1.log`），和本次无关，最终五次运行把它排除在外。www 的 tsc 报错都在没改过的文件里，第 8 步前后完全相同，推断来自本地 `platejs` 构建产物落后，没在 HEAD 上用同样产物复查。

18 步里完成 17 步，开着 1 步（第 4 步），没有跳过或阻塞。

合并 `next` 时，第 7 步的 plitejs 方向键改动让给了 `next` 上按页面是否绘制 caption 来判断的新规则，`plite-empty-object-text-arrows` 这个 changeset 也一起删了。合并后向左键从后一个块退回来时还会在空 caption 里停一次，你随后说 "空的caption就是要从键盘上跳过"，所以 `getObjectReverseEntryTarget` 去掉了这个停靠点：页面没画出来的 caption 文字，不论空不空，方向键在两个方向上都跳过。`EDIT-CAPTION-NAV-003`、媒体文档和 `plite-react-read-only-provider` changeset 跟着改了。`media-caption-delete.spec.ts` 的 "Delete clears a fully selected caption" 在 `origin/next` 上同样失败（`nextctl-delete-a1.log`），和这次合并无关。

## Open work

- "arrow keys traverse the image owner before its caption" 在第 9 步之后的 15 次运行里有 2 次在测试工具设置光标时超时（`final5-chromium-a3.log`、`final8-chromium-a1.log`），第 9 步之前的 10 次里没有出现；单独重跑都能过。可能和图片工具栏多了 Preview 按钮有关，也可能只是偶发，没在 HEAD 上核对。记录在本计划。owner: felixfeng. stop: 下一次 "full" 跑完整矩阵时确认或修掉，或到 2026-10-20。

- 第四个问题：点有 caption 的图片时焦点跑进 caption。单击和双击在 Chromium、WebKit、Firefox 都保持图片选中，预览关闭后在 Chromium 和 WebKit 也保持选中，复现不出来。需要你的浏览器和点击位置。记录在本计划和 `findings.md`。owner: felixfeng. stop: 有了失败用例，或到 2026-10-20。
