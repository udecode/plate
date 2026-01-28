import {
    Dialog,
    activateWait,
    addAlert,
    deactivateWait,
    postJson
} from "../../common"
import {usermediaEditcategoriesTemplate} from "./templates"

export class ImageOverviewCategories {
    constructor(imageOverview) {
        this.imageOverview = imageOverview
        imageOverview.mod.categories = this
    }

    //save changes or create a new category
    saveCategories(cats) {
        activateWait()

        postJson("/api/usermedia/save_category/", {
            ids: cats.ids,
            titles: cats.titles
        })
            .catch(error => {
                addAlert("error", gettext("Could not update categories"))
                deactivateWait()
                throw error
            })
            .then(({json}) => {
                this.imageOverview.app.imageDB.cats = json.entries
                this.setImageCategoryList(json.entries)
                addAlert("success", gettext("The categories have been updated"))
                deactivateWait()
            })
    }

    setImageCategoryList(imageCategories) {
        const catSelector = this.imageOverview.menu.model.content.find(
            menuItem => menuItem.id === "cat_selector"
        )
        catSelector.content = catSelector.content.filter(
            cat => cat.type !== "category"
        )
        catSelector.content = catSelector.content.concat(
            imageCategories.map(cat => ({
                type: "category",
                title: cat.category_title,
                action: _overview => {
                    const trs = document.querySelectorAll(
                        "#imagelist > tbody > tr"
                    )
                    trs.forEach(tr => {
                        if (
                            tr
                                .querySelector(".fw-usermedia-image")
                                .classList.contains(`cat_${cat.id}`)
                        ) {
                            tr.style.display = ""
                        } else {
                            tr.style.display = "none"
                        }
                    })
                }
            }))
        )
        this.imageOverview.menu.update()
    }

    //open a dialog for editing categories
    editCategoryDialog() {
        const buttons = [
            {
                text: gettext("Submit"),
                classes: "fw-dark",
                click: () => {
                    const cats = {
                        ids: [],
                        titles: []
                    }
                    document
                        .querySelectorAll("#edit-categories .category-form")
                        .forEach(el => {
                            const thisVal = el.value.trim()
                            let thisId = el.dataset.id
                            if ("undefined" == typeof thisId) {
                                thisId = 0
                            }
                            if ("" !== thisVal) {
                                cats.ids.push(thisId)
                                cats.titles.push(thisVal)
                            }
                        })
                    this.saveCategories(cats)
                    dialog.close()
                }
            },
            {
                type: "cancel"
            }
        ]

        const dialog = new Dialog({
            id: "edit-categories",
            title: gettext("Edit Categories"),
            body: usermediaEditcategoriesTemplate({
                categories: this.imageOverview.app.imageDB.cats
            }),
            width: 350,
            height: 350,
            buttons
        })
        dialog.open()
    }
}
