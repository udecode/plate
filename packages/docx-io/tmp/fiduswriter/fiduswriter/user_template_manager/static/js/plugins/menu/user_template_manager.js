// Adds a link to the book creator to the main menu on the overview pages.

export class DocTemplatesMenuItem {
    constructor(menu) {
        this.menu = menu
    }

    init() {
        this.menu.navItems.push({
            id: "templates",
            title: gettext("Document Templates"),
            url: "/templates/",
            text: gettext("Templates"),
            order: 4,
            keys: "Alt-t"
        })
    }
}
