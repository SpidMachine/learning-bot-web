import { environment } from '../../../environments/environment';

const DEV_INIT_DATA_KEY = 'DEV_INIT_DATA';

export function getDevInitDataOverride(): string | null {
  if (environment.production) {
    return null;
  }

  return localStorage.getItem(DEV_INIT_DATA_KEY);
}

export function hasValidTelegramInitData(): boolean {
  const devInitData = getDevInitDataOverride();

  if (devInitData) {
    return true;
  }

  const initData = window.Telegram?.WebApp?.initData;
  return Boolean(initData?.length);
}

export function resolveInitData(webAppInitData?: string): string {
  const devInitData = getDevInitDataOverride();

  if (devInitData) {
    return devInitData;
  }

  return webAppInitData ?? '';
}
