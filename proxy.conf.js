/**
 * Dev-proxy: /api → learning-bot-api (:8080).
 * Убираем Origin/Referer — иначе Spring CORS отклоняет trycloudflare.com
 * («Invalid CORS request»), хотя для браузера запрос same-origin.
 */
module.exports = {
  '/api': {
    target: 'http://127.0.0.1:8080',
    secure: false,
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      });
    },
  },
};
