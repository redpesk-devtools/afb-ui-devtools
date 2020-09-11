import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Binders',
    group: true,
  },
  {
    title: 'Hello World',
    icon: 'music',
    link: '/pages/binders/hello-world',
  },
];
