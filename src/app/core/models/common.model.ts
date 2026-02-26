export const SR_FILES_BASE_URL = 'https://sr-cdn-1.shiprocket.in/';
export const SR_FILES_BASE_URL_SRX = 'https://sr-cdn-1.shiprocket.in/srx/';
export const USER_DATA = JSON.parse(localStorage.getItem('ngStorage-USER') || '{}');

export interface TabOption {
  id: number;
  name: string;
  path?: string;
  active?: boolean;
  /** Icon name for ng-icon when tab is active (e.g. 'lucideUser'). Parent must provide the icon. */
  activeIcon?: string;
  /** Icon name for ng-icon when tab is inactive. Parent must provide the icon. */
  inActiveIcon?: string;
}