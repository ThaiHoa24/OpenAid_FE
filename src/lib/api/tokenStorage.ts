const TOKEN_KEY = "openaid_access_token";

/**
 * Danh sách các key auth cần được dọn dẹp sạch khi đăng xuất
 */
const AUTH_STORAGE_KEYS = [
  TOKEN_KEY,
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "openaid_refresh_token",
];

/**
 * Danh sách cookie liên quan đến xác thực cần xóa khi đăng xuất
 */
const AUTH_COOKIE_NAMES = [
  TOKEN_KEY,
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "jwt",
];

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      // 1. Kiểm tra localStorage trước
      const localToken = window.localStorage.getItem(TOKEN_KEY);
      if (localToken) return localToken;

      // 2. Dự phòng kiểm tra sessionStorage
      const sessionToken = window.sessionStorage.getItem(TOKEN_KEY);
      if (sessionToken) return sessionToken;

      // 3. Dự phòng kiểm tra Cookies
      const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  },

  set(token: string): void {
    if (typeof window === "undefined") return;
    try {
      // Lưu vào localStorage
      window.localStorage.setItem(TOKEN_KEY, token);

      // Lưu đồng bộ vào Cookie để hỗ trợ các request/middleware nếu có
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    } catch {
      // Bỏ qua lỗi lưu storage
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      // 1. Xóa toàn bộ token khỏi LocalStorage (giữ nguyên các cài đặt khác như 'openaid-language')
      AUTH_STORAGE_KEYS.forEach((key) => {
        window.localStorage.removeItem(key);
      });

      // 2. Xóa toàn bộ token khỏi SessionStorage nếu có
      AUTH_STORAGE_KEYS.forEach((key) => {
        window.sessionStorage.removeItem(key);
      });

      // 3. Xóa Cookies xác thực trên mọi path phổ biến
      AUTH_COOKIE_NAMES.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
      });
    } catch {
      // Bỏ qua lỗi storage
    }
  },
};
