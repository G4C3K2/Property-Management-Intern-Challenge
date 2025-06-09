export const parseCookies = (cookieHeader: string = ''): Record<string, string> => {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map(cookie => {
        const [key, ...v] = cookie.trim().split('=');
        return [key, v.join('=')];
      })
  );
};