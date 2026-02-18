export type DiscussionIdLike = {
  id: string;
};

const discussionIdPattern = /^discussion(\d+)$/;

export const getDiscussionCounterSeed = (
  discussions: DiscussionIdLike[]
): number =>
  discussions.reduce((max, discussion) => {
    const match = discussionIdPattern.exec(discussion.id);
    if (!match) return max;

    const value = Number(match[1]);
    if (Number.isNaN(value)) return max;

    return Math.max(max, value);
  }, 0);
