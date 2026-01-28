import {CopyrightDialog} from "../../../copyright_dialog"

export const imageMenuModel = () => ({
    content: [
        {
            title: gettext("Set Copyright"),
            type: "action",
            tooltip: gettext("Specify copyright information"),
            order: 0,
            action: figureDialog => {
                const dialog = new CopyrightDialog(figureDialog.copyright)
                dialog.init().then(copyright => {
                    if (copyright) {
                        figureDialog.copyright = copyright
                    }
                })
            }
        },
        {
            title: gettext("Remove image"),
            type: "action",
            tooltip: gettext("Remove the image that is previewed"),
            order: 1,
            action: figureDialog => {
                figureDialog.imgId = false
                figureDialog.imgDb = false
                figureDialog.copyright = false
                figureDialog.layoutMathEditor()
            }
        }
    ]
})
