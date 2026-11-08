const TOKEN_KEY = "openaid_access_token";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Ignore localStorage errors
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore localStorage errors
    }
  },
};
