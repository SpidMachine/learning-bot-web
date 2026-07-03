import { Injectable, signal } from '@angular/core';
import { TelegramThemeParams, TelegramUser, TelegramWebApp } from './telegram.types';

@Injectable({ providedIn: 'root' })
export class TelegramService {
  private webApp: TelegramWebApp | null = null;
  private mainButtonHandler: (() => void) | null = null;
  private backButtonHandler: (() => void) | null = null;

  readonly isAvailable = signal(false);
  readonly user = signal<TelegramUser | null>(null);
  readonly colorScheme = signal<'light' | 'dark'>('light');

  init(): void {
    const app = window.Telegram?.WebApp;

    if (!app) {
      this.applyMockDevMode();
      return;
    }

    this.webApp = app;
    this.isAvailable.set(true);

    app.ready();
    app.expand();
    app.enableClosingConfirmation();

    this.user.set(app.initDataUnsafe.user ?? null);
    this.colorScheme.set(app.colorScheme);
    this.applyTheme(app.themeParams);
  }

  get initData(): string {
    return this.webApp?.initData ?? 'mock_init_data_for_dev';
  }

  hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    this.webApp?.HapticFeedback.impactOccurred(style);
  }

  hapticSuccess(): void {
    this.webApp?.HapticFeedback.notificationOccurred('success');
  }

  hapticError(): void {
    this.webApp?.HapticFeedback.notificationOccurred('error');
  }

  showMainButton(text: string, onClick: () => void): void {
    if (!this.webApp) {
      return;
    }

    const mainButton = this.webApp.MainButton;

    if (this.mainButtonHandler) {
      mainButton.offClick(this.mainButtonHandler);
    }

    this.mainButtonHandler = onClick;
    mainButton.setText(text);
    mainButton.show();
    mainButton.enable();
    mainButton.onClick(onClick);
  }

  hideMainButton(): void {
    if (!this.webApp) {
      return;
    }

    if (this.mainButtonHandler) {
      this.webApp.MainButton.offClick(this.mainButtonHandler);
      this.mainButtonHandler = null;
    }

    this.webApp.MainButton.hide();
  }

  setMainButtonLoading(loading: boolean): void {
    if (!this.webApp) {
      return;
    }

    if (loading) {
      this.webApp.MainButton.showProgress(false);
    } else {
      this.webApp.MainButton.hideProgress();
    }
  }

  showBackButton(onClick: () => void): void {
    if (!this.webApp) {
      return;
    }

    const backButton = this.webApp.BackButton;

    if (this.backButtonHandler) {
      backButton.offClick(this.backButtonHandler);
    }

    this.backButtonHandler = onClick;
    backButton.show();
    backButton.onClick(onClick);
  }

  hideBackButton(): void {
    if (!this.webApp) {
      return;
    }

    if (this.backButtonHandler) {
      this.webApp.BackButton.offClick(this.backButtonHandler);
      this.backButtonHandler = null;
    }

    this.webApp.BackButton.hide();
  }

  close(): void {
    this.webApp?.close();
  }

  private applyTheme(theme: TelegramThemeParams): void {
    const root = document.documentElement;

    if (theme.bg_color) {
      root.style.setProperty('--tg-bg', theme.bg_color);
      this.webApp?.setBackgroundColor(theme.bg_color);
    }
    if (theme.text_color) {
      root.style.setProperty('--tg-text', theme.text_color);
    }
    if (theme.hint_color) {
      root.style.setProperty('--tg-hint', theme.hint_color);
    }
    if (theme.link_color) {
      root.style.setProperty('--tg-link', theme.link_color);
    }
    if (theme.button_color) {
      root.style.setProperty('--tg-button', theme.button_color);
    }
    if (theme.button_text_color) {
      root.style.setProperty('--tg-button-text', theme.button_text_color);
    }
    if (theme.secondary_bg_color) {
      root.style.setProperty('--tg-secondary-bg', theme.secondary_bg_color);
    }
    if (theme.accent_text_color) {
      root.style.setProperty('--tg-accent', theme.accent_text_color);
    }
    if (theme.destructive_text_color) {
      root.style.setProperty('--tg-destructive', theme.destructive_text_color);
    }
    if (theme.header_bg_color) {
      this.webApp?.setHeaderColor(theme.header_bg_color);
    }
  }

  private applyMockDevMode(): void {
    this.user.set({
      id: 1,
      first_name: 'Тест',
      last_name: 'Пользователь',
      username: 'test_user',
      language_code: 'ru',
    });
    this.isAvailable.set(false);
  }
}
