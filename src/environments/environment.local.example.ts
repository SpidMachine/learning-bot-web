/** Пример локального конфига. Скопируйте в environment.local.ts */
export const environmentLocal = {
  production: false,
  /** Через cloudflared + ng serve proxy (рекомендуется) */
  apiBaseUrl: '/api/v1',
  /** Или прямой URL бэкенда, если API на отдельном туннеле: */
  // apiBaseUrl: 'https://YOUR-API.trycloudflare.com/api/v1',
  useMocks: false,
  useMocksOutsideTelegram: true,
};
