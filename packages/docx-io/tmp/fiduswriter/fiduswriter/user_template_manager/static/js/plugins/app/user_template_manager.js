// Adds the templates overview page to the app routing table
export class DocTemplatesAppItem {
    constructor(app) {
        this.app = app
    }

    init() {
        this.app.routes["templates"] = {
            requireLogin: true,
            open: pathnameParts => {
                if (pathnameParts.length < 4) {
                    return import(
                        "../../modules/user_template_manager/overview"
                    ).then(
                        ({DocTemplatesOverview}) =>
                            new DocTemplatesOverview(this.app.config)
                    )
                } else {
                    const id = pathnameParts[2]
                    return import(
                        "../../modules/user_template_manager/editor"
                    ).then(
                        ({DocTemplatesEditor}) =>
                            new DocTemplatesEditor(this.app.config, id)
                    )
                }
            },
            dbTables: {
                list: {
                    keyPath: "id"
                }
            }
        }
    }
}
