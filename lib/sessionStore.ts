let cookieStore = "";

export function getCookies() {
  return cookieStore;
}

export function setCookies(cookie: string) {
  cookieStore = cookie;
}
