/**
 * Convert provider awareness to an array of users
 *
 * @param {Object} states The provider's awareness states object
 */
export const awarenessStatesToArray = (context, states) => {
  const seenUsers = new Set();

  return Array.from(states.entries())
    .filter(([, value]) => {
      if (!value.user) return false;
      return !seenUsers.has(value.user?.email) && seenUsers.add(value.user?.email);
    })
    .map(([key, value]) => {
      const email = value.user.email;

      if (!context.userColorMap.has(email)) {
        context.userColorMap.set(email, context.config.colors[context.colorIndex % context.config.colors.length]);
        context.colorIndex++;
      }

      return {
        clientId: key,
        ...value.user,
        color: context.userColorMap.get(email),
      };
    });
};

/**
 * Shuffle an array of strings (colors)
 * @param {Array[string]} array List of hex colors
 * @returns {Array[string]} Shuffled array of hex colors
 */
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
