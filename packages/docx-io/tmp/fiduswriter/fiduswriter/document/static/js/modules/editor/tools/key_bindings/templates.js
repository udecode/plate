export const keyBindingsTemplate = () =>
    `<div id="helpListWrap" class="help-list-wrap">
        <ul class="help-list">
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+p</span></kbd>
            <span class="help-key-def">${gettext("Print")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+s</span></kbd>
            <span class="help-key-def">${gettext("Save revision")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>Shift+CTRL+/</span></kbd>
            <span class="help-key-def">${gettext("Show keyboard shortcuts")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+V</span></kbd>
            <span class="help-key-def">${gettext("Paste with content detection")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>Shift+CTRL+V</span></kbd>
            <span class="help-key-def">${gettext("Paste without content detection")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>Drop (from drag)</span></kbd>
            <span class="help-key-def">${gettext("Paste with content detection")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>Shift+Drop (from drag)</span></kbd>
            <span class="help-key-def">${gettext("Paste without content detection")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+H</span></kbd>
            <span class="help-key-def">${gettext("Search and replace")}</span>
          </li>
        </ul><!-- .help-list -->
        <ul class="help-list">
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+B</span></kbd>
            <span class="help-key-def">${gettext("Bold")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+I</span></kbd>
            <span class="help-key-def">${gettext("Italics")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+[</span></kbd>
            <kbd class="fw-button fw-light fw-small"><span>CTRL+&lt;</span></kbd>
            <span class="help-key-def">${gettext("Lift")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+Shift+8</span></kbd>
            <span class="help-key-def">${gettext("Wrap selection in bullet list")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+Shift+9</span></kbd>
            <span class="help-key-def">${gettext("Wrap selection in numbered list")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+Z</span></kbd>
            <span class="help-key-def">${gettext("Undo")}</span>
          </li>
          <li class="help-key-unit">
            <kbd class="fw-button fw-light fw-small"><span>CTRL+Shift+Z</span></kbd>
            <span class="help-key-def">${gettext("Redo")}</span>
          </li>
        </ul><!-- .help-list -->
      </div><!-- .help-list-wrap -->`
