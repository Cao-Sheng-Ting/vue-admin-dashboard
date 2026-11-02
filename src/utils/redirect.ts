export const getSafeRedirect = (redirect: unknown): string =>
  typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
