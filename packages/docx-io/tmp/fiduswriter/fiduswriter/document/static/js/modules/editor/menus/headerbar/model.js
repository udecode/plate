import {CopyrightDialog} from "../../../copyright_dialog"
import {DocumentAccessRightsDialog} from "../../../documents/access_rights"
import {SaveCopy, SaveRevision} from "../../../exporter/native"
import {ExportFidusFile} from "../../../exporter/native/file"
import {LanguageDialog, RevisionDialog} from "../../dialogs"
import {
    KeyBindingsDialog,
    SearchReplaceDialog,
    WordCountDialog
} from "../../tools"

const languageItem = (language, name, order) => ({
    title: name,
    type: "setting",
    order,
    action: editor => {
        editor.view.dispatch(
            editor.view.state.tr
                .setDocAttribute("language", language)
                .setMeta("settings", true)
        )
    },
    selected: editor => {
        return editor.view.state.doc.attrs.language === language
    },
    available: editor => {
        return editor.view.state.doc.attrs.languages.includes(language)
    }
})

export const headerbarModel = () => ({
    open: window.innerWidth > 500, // Whether the menu is shown at all.
    content: [
        {
            id: "file",
            title: gettext("File"),
            tooltip: gettext("File handling"),
            type: "menu",
            keys: "Alt-f",
            order: 0,
            content: [
                {
                    title: gettext("Share"),
                    type: "action",
                    //icon: 'share',
                    tooltip: gettext("Share the document with other users."),
                    order: 0,
                    action: editor => {
                        const dialog = new DocumentAccessRightsDialog(
                            [editor.docInfo.id],
                            editor.docInfo.owner.contacts,
                            contactData => {
                                editor.docInfo.owner.contacts.push(contactData)
                            }
                        )
                        dialog.init()
                    },
                    disabled: editor => {
                        return (
                            !editor.docInfo.is_owner || editor.app.isOffline()
                        )
                    }
                },
                {
                    title: gettext("Close"),
                    type: "action",
                    //icon: 'times-circle',
                    tooltip: gettext(
                        "Close the document and return to the document overview menu."
                    ),
                    order: 1,
                    action: editor => {
                        const folderPath = editor.docInfo.path.slice(
                            0,
                            editor.docInfo.path.lastIndexOf("/")
                        )
                        if (
                            !folderPath.length &&
                            editor.app.routes[""].app === "document"
                        ) {
                            editor.app.goTo("/")
                        } else {
                            editor.app.goTo(`/documents${folderPath}/`)
                        }
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("Save revision"),
                    type: "action",
                    //icon: 'save',
                    tooltip: gettext("Save a revision of the document."),
                    order: 2,
                    keys: "Ctrl-s",
                    action: editor => {
                        const dialog = new RevisionDialog(editor.docInfo.dir)
                        dialog.init().then(note => {
                            const saver = new SaveRevision(
                                editor.getDoc(),
                                editor.mod.db.imageDB,
                                editor.mod.db.bibDB,
                                note,
                                editor.app
                            )
                            return saver.init()
                        })
                    },
                    disabled: editor =>
                        editor.docInfo.access_rights !== "write" ||
                        editor.app.isOffline()
                },
                {
                    title: gettext("Create copy"),
                    type: "action",
                    //icon: 'copy',
                    tooltip: gettext("Create a copy of the document."),
                    order: 3,
                    action: editor => {
                        const copier = new SaveCopy(
                            editor.getDoc(),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.user
                        )
                        copier
                            .init()
                            .then(({docInfo}) =>
                                editor.app.goTo(`/document/${docInfo.id}/`)
                            )
                            .catch(() => false)
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("Download"),
                    type: "action",
                    //icon: 'download',
                    tooltip: gettext(
                        "Export the document as a FIDUS file including its template."
                    ),
                    order: 4,
                    action: editor => {
                        new ExportFidusFile(
                            editor.getDoc(),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB
                        )
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("Print/PDF"),
                    type: "action",
                    //icon: 'print',
                    tooltip: gettext(
                        "Either print or create a PDF using your browser print dialog."
                    ),
                    order: 5,
                    keys: "Ctrl-p",
                    action: editor => {
                        import("../../../exporter/print").then(
                            ({PrintExporter}) => {
                                const exporter = new PrintExporter(
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated,
                                    editor.mod.documentTemplate.documentStyles
                                )
                                exporter.init()
                            }
                        )
                    }
                }
            ]
        },
        {
            id: "export",
            title: gettext("Export"),
            tooltip: gettext("Export of the document contents"),
            type: "menu",
            order: 1,
            keys: "Alt-e",
            content: [
                {
                    title: gettext("HTML"),
                    type: "action",
                    tooltip: gettext("Export the document to an HTML file."),
                    order: 0,
                    action: editor => {
                        import("../../../exporter/html").then(
                            ({HTMLExporter}) => {
                                const exporter = new HTMLExporter(
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated,
                                    editor.mod.documentTemplate.documentStyles
                                )
                                exporter.init()
                            }
                        )
                    }
                },
                {
                    title: gettext("Epub"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to an Epub electronic reader file."
                    ),
                    order: 1,
                    action: editor => {
                        import("../../../exporter/epub").then(
                            ({EpubExporter}) => {
                                const exporter = new EpubExporter(
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated,
                                    editor.mod.documentTemplate.documentStyles
                                )
                                exporter.init()
                            }
                        )
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("LaTeX"),
                    type: "action",
                    tooltip: gettext("Export the document to an LaTeX file."),
                    order: 2,
                    action: editor => {
                        import("../../../exporter/latex").then(
                            ({LatexExporter}) => {
                                const exporter = new LatexExporter(
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("JATS"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a Journal Archiving and Interchange Tag Library NISO JATS Version 1.2 file."
                    ),
                    order: 2,
                    action: editor => {
                        import("../../../exporter/jats").then(
                            ({JATSExporter}) => {
                                const exporter = new JATSExporter(
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated,
                                    "article"
                                )
                                exporter.init()
                            }
                        )
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("BITS"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a Book Interchange Tag Set BITS Version 2.1 file."
                    ),
                    order: 2,
                    action: editor => {
                        import("../../../exporter/jats").then(
                            ({JATSExporter}) => {
                                const exporter = new JATSExporter(
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated,
                                    "book-part-wrapper"
                                )
                                exporter.init()
                            }
                        )
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("Pandoc JSON"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a Pandoc JSON file."
                    ),
                    order: 3,
                    action: editor => {
                        import("../../../exporter/pandoc").then(
                            ({PandocExporter}) => {
                                const exporter = new PandocExporter(
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    },
                    disabled: editor => editor.app.isOffline()
                },
                {
                    title: gettext("Slim FIDUS"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a FIDUS file without its template."
                    ),
                    order: 4,
                    action: editor => {
                        new ExportFidusFile(
                            editor.getDoc(),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            false
                        )
                    }
                }
            ]
        },
        {
            id: "settings",
            title: gettext("Settings"),
            tooltip: gettext("Configure settings of this document."),
            type: "menu",
            order: 2,
            keys: "Alt-s",
            content: [
                {
                    id: "citation_style",
                    title: gettext("Citation Style"),
                    type: "menu",
                    tooltip: gettext("Choose your preferred citation style."),
                    order: 1,
                    disabled: editor => {
                        return editor.docInfo.access_rights !== "write"
                    },
                    content: []
                },
                {
                    id: "document_style",
                    title: gettext("Document Style"),
                    type: "menu",
                    tooltip: gettext("Choose your preferred document style."),
                    order: 2,
                    disabled: editor => {
                        return (
                            editor.docInfo.access_rights !== "write" ||
                            editor.app.isOffline()
                        )
                    },
                    content: []
                },
                {
                    id: "language",
                    title: gettext("Text Language"),
                    type: "menu",
                    tooltip: gettext("Choose the language of the document."),
                    order: 3,
                    disabled: editor => {
                        return editor.docInfo.access_rights !== "write"
                    },
                    content: [
                        languageItem(
                            "en-US",
                            gettext("English (United States)"),
                            0
                        ),
                        languageItem(
                            "en-GB",
                            gettext("English (United Kingdom)"),
                            1
                        ),
                        languageItem("de-DE", gettext("German (Germany)"), 2),
                        languageItem(
                            "zh-CN",
                            gettext("Chinese (Simplified)"),
                            3
                        ),
                        languageItem("es", gettext("Spanish"), 4),
                        languageItem("fr", gettext("French"), 5),
                        languageItem("ja", gettext("Japanese"), 6),
                        languageItem("it", gettext("Italian"), 7),
                        //languageItem('pl', gettext('Polish'), 8),
                        languageItem(
                            "pt-BR",
                            gettext("Portuguese (Brazil)"),
                            9
                        ),
                        //languageItem('nl', gettext('Dutch'), 10),
                        //languageItem('ru', gettext('Russian'), 11),
                        {
                            type: "separator",
                            order: 12,
                            available: editor => {
                                // There has to be at least one language of the default languages
                                // among the default ones and one that is not among the default ones.
                                return (
                                    !!editor.view.state.doc.attrs.languages.find(
                                        lang =>
                                            [
                                                "en-US",
                                                "en-GB",
                                                "de-DE",
                                                "zh-CN",
                                                "es",
                                                "fr",
                                                "ja",
                                                "it",
                                                "pl",
                                                "pt-BR",
                                                "nl",
                                                "ru"
                                            ].includes(lang)
                                    ) &&
                                    !!editor.view.state.doc.attrs.languages.find(
                                        lang =>
                                            ![
                                                "en-US",
                                                "en-GB",
                                                "de-DE",
                                                "zh-CN",
                                                "es",
                                                "fr",
                                                "ja",
                                                "it",
                                                "pl",
                                                "pt-BR",
                                                "nl",
                                                "ru"
                                            ].includes(lang)
                                    )
                                )
                            }
                        },
                        {
                            title: gettext("Other"),
                            type: "setting",
                            order: 13,
                            action: editor => {
                                const language =
                                        editor.view.state.doc.attrs.language,
                                    dialog = new LanguageDialog(
                                        editor,
                                        language
                                    )
                                dialog.init()
                            },
                            selected: editor => {
                                return ![
                                    "en-US",
                                    "en-GB",
                                    "de-DE",
                                    "zh-CN",
                                    "es",
                                    "fr",
                                    "ja",
                                    "it",
                                    "pl",
                                    "pt-BR",
                                    "nl",
                                    "ru"
                                ].includes(editor.view.state.doc.attrs.language)
                            },
                            available: editor =>
                                !!editor.view.state.doc.attrs.languages.find(
                                    lang =>
                                        ![
                                            "en-US",
                                            "en-GB",
                                            "de-DE",
                                            "zh-CN",
                                            "es",
                                            "fr",
                                            "ja",
                                            "it",
                                            "pl",
                                            "pt-BR",
                                            "nl",
                                            "ru"
                                        ].includes(lang)
                                )
                        }
                    ]
                },
                {
                    id: "paper_size",
                    title: gettext("Paper Size"),
                    type: "menu",
                    tooltip: gettext(
                        "Choose a papersize for print and PDF generation."
                    ),
                    order: 4,
                    disabled: editor => {
                        return editor.docInfo.access_rights !== "write"
                    },
                    content: [
                        {
                            title: gettext("DIN A4"),
                            type: "setting",
                            tooltip: gettext(
                                "A4 (DIN A4/ISO 216) which is used in most of the world."
                            ),
                            order: 0,
                            action: editor => {
                                editor.view.dispatch(
                                    editor.view.state.tr
                                        .setDocAttribute("papersize", "A4")
                                        .setMeta("settings", true)
                                )
                            },
                            selected: editor => {
                                return (
                                    editor.view.state.doc.attrs.papersize ===
                                    "A4"
                                )
                            },
                            available: editor => {
                                return editor.view.state.doc.attrs.papersizes.includes(
                                    "A4"
                                )
                            }
                        },
                        {
                            title: gettext("US Letter"),
                            type: "setting",
                            tooltip: gettext(
                                "The format used by the USA and some other American countries."
                            ),
                            order: 1,
                            action: editor => {
                                editor.view.dispatch(
                                    editor.view.state.tr
                                        .setDocAttribute(
                                            "papersize",
                                            "US Letter"
                                        )
                                        .setMeta("settings", true)
                                )
                            },
                            selected: editor => {
                                return (
                                    editor.view.state.doc.attrs.papersize ===
                                    "US Letter"
                                )
                            },
                            available: editor => {
                                return editor.view.state.doc.attrs.papersizes.includes(
                                    "US Letter"
                                )
                            }
                        }
                    ]
                },
                {
                    title: gettext("Copyright Information"),
                    type: "setting",
                    order: 5,
                    action: editor => {
                        const dialog = new CopyrightDialog(
                            editor.view.state.doc.attrs.copyright
                        )
                        dialog.init().then(copyright => {
                            if (copyright) {
                                editor.view.dispatch(
                                    editor.view.state.tr
                                        .setDocAttribute("copyright", copyright)
                                        .setMeta("settings", true)
                                )
                            }
                            editor.currentView.focus()
                        })
                    },
                    disabled: editor => editor.docInfo.access_rights !== "write"
                }
            ]
        },
        {
            id: "tools",
            title: gettext("Tools"),
            tooltip: gettext("Select document editing tool."),
            type: "menu",
            order: 3,
            keys: "Alt-t",
            content: [
                {
                    title: gettext("Word counter"),
                    type: "action",
                    tooltip: gettext("See document statistics."),
                    order: 0,
                    action: editor => {
                        const dialog = new WordCountDialog(editor)
                        dialog.init()
                    }
                },
                {
                    title: gettext("Search and replace"),
                    type: "action",
                    tooltip: gettext("Show a search and replace dialog."),
                    order: 1,
                    keys: "Ctrl-h",
                    action: editor => {
                        const dialog = new SearchReplaceDialog(editor)
                        dialog.init()
                    }
                },
                {
                    title: gettext("Keyboard shortcuts"),
                    type: "action",
                    tooltip: gettext(
                        "Show an overview of available keyboard shortcuts."
                    ),
                    order: 2,
                    keys: "Shift-Ctrl-/",
                    action: editor => {
                        const dialog = new KeyBindingsDialog(editor)
                        dialog.init()
                    }
                }
            ]
        },
        {
            title: gettext("Track changes"),
            type: "menu",
            tooltip: gettext("Tracking changes to the document"),
            order: 4,
            keys: "Alt-c",
            disabled: editor => editor.docInfo.access_rights !== "write",
            content: [
                {
                    title: gettext("Record"),
                    type: "setting",
                    tooltip: gettext("Record document changes"),
                    order: 0,
                    disabled: editor => {
                        return editor.docInfo.access_rights !== "write"
                    },
                    action: editor => {
                        const tracked = !editor.view.state.doc.attrs.tracked
                        editor.view.dispatch(
                            editor.view.state.tr
                                .setDocAttribute("tracked", tracked)
                                .setMeta("settings", true)
                        )
                    },
                    selected: editor => {
                        return editor.view.state.doc.attrs.tracked === true
                    }
                },
                {
                    title: gettext("Accept all"),
                    type: "action",
                    tooltip: gettext("Accept all tracked changes."),
                    order: 1,
                    action: editor => {
                        editor.mod.track.acceptAll()
                    }
                },
                {
                    title: gettext("Reject all"),
                    type: "action",
                    tooltip: gettext("Reject all tracked changes."),
                    order: 2,
                    action: editor => {
                        editor.mod.track.rejectAll()
                    }
                }
            ]
        }
    ]
})
