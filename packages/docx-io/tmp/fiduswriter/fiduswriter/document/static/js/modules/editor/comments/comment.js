export class Comment {
    constructor({
        id,
        user,
        username,
        assignedUser = false,
        assignedUsername = false,
        date,
        comment = [],
        answers = [],
        isMajor = false,
        resolved = false,
        hidden = false
    }) {
        this.id = id
        this.user = user // User ID of user who wrote comment
        this.username = username // Username of user who wrote comment
        this.assignedUser = assignedUser // User ID of user who is currently assigned to comment (if any).
        this.assignedUsername = assignedUsername // Username of user who is currently assigned to comment (if any).
        this.date = date
        this.comment = comment
        this.answers = answers
        this.isMajor = isMajor // boolean - Whether comment is of major importance.
        this.resolved = resolved // Whether comment is marked as resolved.
        this.hidden = hidden
    }
}
