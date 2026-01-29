export const bulkMenuModel = () => ({
    content: [
        {
            title: gettext("Delete selected"),
            tooltip: gettext("Delete selected images."),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.deleteImageDialog(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline()
        }
    ]
})

export const menuModel = () => ({
    content: [
        {
            type: "dropdown",
            id: "cat_selector",
            keys: "Alt-c",
            content: [
                {
                    title: gettext("All categories"),
                    action: _overview => {
                        const trs = document.querySelectorAll(
                            "#imagelist > tbody > tr"
                        )
                        trs.forEach(tr => (tr.style.display = ""))
                    }
                }
            ],
            order: 1
        },
        {
            type: "text",
            title: gettext("Edit categories"),
            keys: "Alt-e",
            action: overview => overview.mod.categories.editCategoryDialog(),
            order: 2,
            disabled: overview => overview.app.isOffline()
        },
        {
            type: "text",
            title: gettext("Upload new image"),
            keys: "Alt-u",
            action: overview => {
                import("../edit_dialog").then(({ImageEditDialog}) => {
                    const imageUpload = new ImageEditDialog(
                        overview.app.imageDB,
                        false,
                        overview
                    )
                    imageUpload.init().then(imageId => {
                        overview.updateTable([imageId])
                    })
                })
            },
            order: 3,
            disabled: overview => overview.app.isOffline()
        },
        {
            type: "search",
            icon: "search",
            title: gettext("Search images"),
            keys: "Alt-s",
            input: (overview, text) => overview.table.search(text),
            order: 4
        }
    ]
})
