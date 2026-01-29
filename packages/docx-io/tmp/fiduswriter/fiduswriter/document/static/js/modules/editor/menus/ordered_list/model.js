import {OrderedListStartDialog} from "../../dialogs"

export const orderedListMenuModel = () => ({
    content: [
        {
            title: gettext("Set list start number"),
            type: "action",
            tooltip: gettext(
                "Specify the number from which this list is to start counting"
            ),
            order: 0,
            action: editor => {
                const dialog = new OrderedListStartDialog(editor)
                dialog.init()
                return false
            }
        }
    ]
})
