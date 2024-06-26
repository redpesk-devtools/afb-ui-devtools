import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { environment } from '../../../../environments/environment.prod';

import { map, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { AFBWebSocketService, SocketStatus } from '../../../@core/services/AFB-websocket.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})

export class HeaderComponent implements OnInit, OnDestroy {
  gitTag: string = environment.GIT_TAG;

  private destroy$: Subject<void> = new Subject<void>();
  windowMonitoring;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';
  checked = true;

  userMenu = [ { title: 'Profile' }, { title: 'Log out' } ];
  wsStatus$: Observable<SocketStatus>;

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private afbService: AFBWebSocketService) {
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
      this.wsStatus$ = this.afbService.Status$;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  Connect() {
    this.afbService.Disconnect();
    this.afbService.Connect();
  }

  Disconnect() {
    this.afbService.Disconnect();
  }

  OpenMonitoring() {
    this.windowMonitoring = window.open('/monitoring/monitor.html', '_monitor_ctl');
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
