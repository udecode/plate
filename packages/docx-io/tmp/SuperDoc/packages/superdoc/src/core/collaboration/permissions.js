export const PERMISSIONS = Object.freeze({
  RESOLVE_OWN: 'RESOLVE_OWN',
  RESOLVE_OTHER: 'RESOLVE_OTHER',
  REJECT_OWN: 'REJECT_OWN',
  REJECT_OTHER: 'REJECT_OTHER',
  COMMENTS_OVERFLOW_OWN: 'COMMENTS_OVERFLOW',
  COMMENTS_OVERFLOW_OTHER: 'COMMENTS_OVERFLOW_OTHER',
  COMMENTS_DELETE_OWN: 'COMMENTS_DELETE_OWN',
  COMMENTS_DELETE_OTHER: 'COMMENTS_DELETE_OTHER',
  UPLOAD_VERSION: 'UPLOAD_VERSION',
  VERSION_HISTORY: 'VERSION_HISTORY',
});

const ROLES = Object.freeze({
  EDITOR: 'editor',
  SUGGESTER: 'suggester',
  VIEWER: 'viewer',
});

const permissions = Object.freeze({
  [PERMISSIONS.RESOLVE_OWN]: {
    internal: [ROLES.EDITOR],
    external: [ROLES.EDITOR],
  },
  [PERMISSIONS.RESOLVE_OTHER]: {
    internal: [ROLES.EDITOR],
    external: [],
  },
  [PERMISSIONS.REJECT_OWN]: {
    internal: [ROLES.EDITOR, ROLES.SUGGESTER],
    external: [ROLES.EDITOR, ROLES.SUGGESTER],
  },
  [PERMISSIONS.REJECT_OTHER]: {
    internal: [ROLES.EDITOR],
    external: [],
  },
  [PERMISSIONS.COMMENTS_OVERFLOW_OWN]: {
    internal: [ROLES.EDITOR, ROLES.SUGGESTER],
    external: [ROLES.EDITOR, ROLES.SUGGESTER],
  },
  [PERMISSIONS.COMMENTS_OVERFLOW_OTHER]: {
    internal: [ROLES.EDITOR],
    external: [],
  },
  [PERMISSIONS.COMMENTS_DELETE_OWN]: {
    internal: [ROLES.EDITOR, ROLES.SUGGESTER],
    external: [ROLES.EDITOR, ROLES.SUGGESTER],
  },
  [PERMISSIONS.COMMENTS_DELETE_OTHER]: {
    internal: [ROLES.EDITOR],
    external: [],
  },
  [PERMISSIONS.UPLOAD_VERSION]: {
    internal: [ROLES.EDITOR],
    external: [],
  },
  [PERMISSIONS.VERSION_HISTORY]: {
    internal: [ROLES.EDITOR],
    external: [],
  },
});

/**
 * Check if a role is allowed to perform a permission
 *
 * @param {String} permission The permission to check
 * @param {String} role The role to check
 * @param {Boolean} isInternal The internal/external flag
 * @returns {Boolean} True if the role is allowed to perform the permission
 */
export const isAllowed = (permission, role, isInternal) => {
  const internalExternal = isInternal ? 'internal' : 'external';
  return permissions[permission]?.[internalExternal]?.includes(role);
};
