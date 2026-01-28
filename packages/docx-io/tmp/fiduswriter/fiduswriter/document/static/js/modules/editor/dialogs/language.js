import {Dialog} from "../../common"

import {LANGUAGES} from "../../schema/const"
import {languageTemplate} from "./templates"

export class LanguageDialog {
    constructor(editor, language) {
        this.editor = editor
        this.language = language
        this.dialog = false
    }

    init() {
        const buttons = []
        buttons.push({
            text: gettext("Change"),
            classes: "fw-dark",
            click: () => {
                const language =
                    this.dialog.dialogEl.querySelector("select").value
                this.dialog.close()

                if (language === this.language) {
                    // No change.
                    return
                }
                this.editor.view.dispatch(
                    this.editor.view.state.tr
                        .setDocAttribute("language", language)
                        .setMeta("settings", true)
                )
                return
            }
        })

        buttons.push({
            type: "cancel"
        })

        this.dialog = new Dialog({
            width: 300,
            height: 180,
            id: "select-document-language",
            title: gettext("Change language of the document"),
            body: languageTemplate({
                currentLanguage: this.language,
                allowedLanguages: LANGUAGES.filter(lang =>
                    this.editor.view.state.doc.attrs.languages.includes(lang[0])
                )
            }),
            buttons,
            onClose: () => this.editor.currentView.focus(),
            restoreActiveElement: false
        })

        this.dialog.open()
    }
}
