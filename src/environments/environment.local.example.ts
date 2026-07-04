/** Пример локального конфига. Скопируйте в environment.local.ts */
export const environment = {
  production: false,
  /** Через ngrok + ng serve proxy (рекомендуется) */
  apiBaseUrl: '/api/v1',
  /** Или прямой URL бэкенда, если API тоже на ngrok: */
  // apiBaseUrl: 'https://YOUR-API-NGROK.ngrok-free.app/api/v1',
  useMocks: false,
  useMocksOutsideTelegram: false,
};
