/**
 * @license
 * Copyright (C) 2019-2021 IoT.bzh Company
 * Contact: https://www.iot.bzh/licensing
 *
 * This file is part of the afb-ui-devtools module of the redpesk® project.
 *
 * $RP_BEGIN_LICENSE$
 * Commercial License Usage
 *  Licensees holding valid commercial IoT.bzh licenses may use this file in
 *  accordance with the commercial license agreement provided with the
 *  Software or, alternatively, in accordance with the terms contained in
 *  a written agreement between you and The IoT.bzh Company. For licensing terms
 *  and conditions see https://www.iot.bzh/terms-conditions. For further
 *  information use the contact form at https://www.iot.bzh/contact.
 *
 * GNU General Public License Usage
 *  Alternatively, this file may be used under the terms of the GNU General
 *  Public license version 3. This license is as published by the Free Software
 *  Foundation and appearing in the file LICENSE.GPLv3 included in the packaging
 *  of this file. Please review the following information to ensure the GNU
 *  General Public License requirements will be met
 *  https://www.gnu.org/licenses/gpl-3.0.html.
 * $RP_END_LICENSE$
 */

import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, Renderer2, ViewChild, HostListener } from '@angular/core';
// import { DOCUMENT } from '@angular/common';
import { Subscription, Observable, BehaviorSubject, Subject } from 'rxjs';
import { AFBWebSocketService, SocketStatus, AFBApi } from '../../../@core/services/AFB-websocket.service';
import { NbPopoverDirective, NbToastrService } from '@nebular/theme';
import { map } from 'rxjs/operators';


@Component({
  selector: 'rp-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CoreComponent implements OnInit, OnDestroy {

  dataFromServer: string;
  wsSubscription: Subscription;
  evtidx: number;
  count: number;
  query: Array<Array<Array<string>>> = [[[]]];
  host: string = 'localhost';
  port: string = '1234';

  private _eventArray: Array<string> = [];
  private _eventSubject = <BehaviorSubject<Array<string>>>new BehaviorSubject(this._eventArray);
  private _questionsSubject = new Subject<Array<String>>();
  private _responsesSubject = new Subject<Array<Array<string>>>();
  wsStatus$: Observable<SocketStatus>;
  verbs$: Observable<Array<AFBApi>>;
  info$: Observable<Array<object>>;
  questions$: Observable<Array<String>>;
  responses$: Observable<Array<Array<string>>>;
  questions: Array<String>;
  responses: Array<Array<string>>;
  raw_questions: Array<String>;
  raw_responses: Array<Array<string>>;
  raw_events: Array<string> = [];
  event$: Observable<Array<string>>;
  info: Array<object>;
  connected = true;
  initEvents$: Observable<any>;

  displayMode: string = 'default'; // Default display mode in responses section

  optionsSelect: any = [
    'default',
    'line',
    'columns'
  ]

  // Sidebar
  sidebarWidth: number = 450; // Initial sidebar width
  isResizing: boolean = false;
  lastDownX: number = 0;

  // Total content height
  // contentHeight: string = '100vh';
  // contentHeight: number = window.innerHeight;
  // [ngStyle]="{'height.px': section1Height}"

  // Heights of the content sections (initially set to 1/3 of the total height)
  section1Height: number = (window.innerHeight - 64) / 3;
  section2Height: number = (window.innerHeight - 64) / 3;
  section3Height: number = (window.innerHeight - 64) / 3;

  // Track accordion states
  section1Expanded: boolean = true;
  section2Expanded: boolean = true;
  section3Expanded: boolean = true;

  isVerticalResizing: boolean = false;
  activeSection: number = 0;
  lastDownY: number = 0;

  // Header height when accordion is collapsed
  readonly COLLAPSED_HEADER_HEIGHT = 45;

  // Start resizing when the mouse is down on the resizer
  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    this.lastDownX = event.clientX;
    event.preventDefault();
  }

  // Start vertical resizing for the content sections
  startVerticalResizing(event: MouseEvent, section: number): void {
    this.isVerticalResizing = true;
    this.activeSection = section;
    this.lastDownY = event.clientY;
    event.preventDefault();
  }

  // Detect mouse move for resizing
  @HostListener('window:mousemove', ['$event'])

  onMouseMove(event: MouseEvent): void {
    // Horizontal resizing for sidebar
    if (this.isResizing) {
      const newWidth = this.sidebarWidth + (event.clientX - this.lastDownX);
      if (newWidth > 200 && newWidth < 1200) { // Minimum and maximum width for the sidebar
        this.sidebarWidth = newWidth;
        this.lastDownX = event.clientX;
      }
    }

    // Vertical resizing for sections
    if (this.isVerticalResizing) {
      const delta = event.clientY - this.lastDownY;
      if (this.activeSection === 1) {
        // Only allow resizing if both sections are expanded
        if (this.section1Expanded && this.section2Expanded) {
          const newHeight1 = this.section1Height + delta;
          const newHeight2 = this.section2Height - delta;
          if (newHeight1 > 50 && newHeight2 > 50) {
            this.section1Height = newHeight1;
            this.section2Height = newHeight2;
            this.lastDownY = event.clientY;
          }
        }
      } else if (this.activeSection === 2) {
        // Only allow resizing if both sections are expanded
        if (this.section2Expanded && this.section3Expanded) {
          const newHeight2 = this.section2Height + delta;
          const newHeight3 = this.section3Height - delta;
          if (newHeight2 > 50 && newHeight3 > 50) {
            this.section2Height = newHeight2;
            this.section3Height = newHeight3;
            this.lastDownY = event.clientY;
          }
        }
      } else if (this.activeSection === 3) {
        // Resize section 3 upwards (only if expanded)
        if (this.section3Expanded) {
          const newHeight3 = this.section3Height + delta;
          if (newHeight3 > 50) {
            this.section3Height = newHeight3;
            this.lastDownY = event.clientY;
          }
        }
      }
    }
  }

  // Stop resizing when mouse is released
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isResizing = false;
    this.isVerticalResizing = false;
  }

  // Handle window resize to redistribute space
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    this.redistributeSpace();
  }

  onSectionHeaderClick(event: MouseEvent, sectionNumber: number): void {
    // Toggle the expanded state
    switch (sectionNumber) {
      case 1:
        this.section1Expanded = !this.section1Expanded;
        break;
      case 2:
        this.section2Expanded = !this.section2Expanded;
        break;
      case 3:
        this.section3Expanded = !this.section3Expanded;
        break;
      default:
        console.error('Invalid section number');
        return;
    }

    // Recalculate heights after state change
    this.redistributeSpace();
  }

  // Calculate and redistribute space among accordions
  private redistributeSpace(): void {
    const totalAvailableHeight = window.innerHeight - 64; // Subtract header height
    const numberOfExpandedSections =
      (this.section1Expanded ? 1 : 0) +
      (this.section2Expanded ? 1 : 0) +
      (this.section3Expanded ? 1 : 0);

    if (numberOfExpandedSections === 0) {
      // All sections collapsed - give them all header height
      this.section1Height = this.COLLAPSED_HEADER_HEIGHT;
      this.section2Height = this.COLLAPSED_HEADER_HEIGHT;
      this.section3Height = this.COLLAPSED_HEADER_HEIGHT;
      return;
    }

    // Calculate space for collapsed sections
    const collapsedSpace =
      (!this.section1Expanded ? this.COLLAPSED_HEADER_HEIGHT : 0) +
      (!this.section2Expanded ? this.COLLAPSED_HEADER_HEIGHT : 0) +
      (!this.section3Expanded ? this.COLLAPSED_HEADER_HEIGHT : 0);

    // Remaining space to distribute among expanded sections
    const remainingSpace = totalAvailableHeight - collapsedSpace;
    const spacePerExpandedSection = remainingSpace / numberOfExpandedSections;

    // Assign heights
    this.section1Height = this.section1Expanded ? spacePerExpandedSection : this.COLLAPSED_HEADER_HEIGHT;
    this.section2Height = this.section2Expanded ? spacePerExpandedSection : this.COLLAPSED_HEADER_HEIGHT;
    this.section3Height = this.section3Expanded ? spacePerExpandedSection : this.COLLAPSED_HEADER_HEIGHT;
  }

  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

  constructor(
    // @Inject(DOCUMENT) private document: Document,
    private afbService: AFBWebSocketService,
    private renderer: Renderer2,
    private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.wsStatus$ = this.afbService.Status$;
    this.verbs$ = this.afbService.Discover();
    this.afbService.getApis();
    this.questions = [];
    this.responses = [];
    this.info$ = this.afbService.getInfoVerbs();
    this.questions$ = this._questionsSubject.asObservable();
    this.responses$ = this._responsesSubject.asObservable();
    this.count = 0;
    this.evtidx = 0;
    this.event$ = this._eventSubject.asObservable();
    this.initEvents$ = this.afbService.OnEvent('*').pipe(map(d => {
      this._eventArray.unshift(this.evtidx + ' : ' + this.afbService.syntaxHighlight(d));
      this.evtidx++;
      this._eventSubject.next(this._eventArray);
    }));
  }

  checkInfo(info: Array<Object>): boolean {
    let hasInfo = false;
    info.forEach(infoverb => {
      if (infoverb !== undefined) {
        hasInfo = true;
      }
    }, hasInfo);
    return hasInfo;
  }

  callBinder(api: string, verb: string, query: string, connected: boolean) {
    if (connected === true) {
      if (verb.charAt(0) === '/') {
        verb = verb.substring(1);
      }
      const proto = (window.location.protocol === 'https:' ? 'wss://' : 'ws://');
      let req = this.count + ': ' + proto + this.afbService.GetUrl() + '/api/' + api + '/' + verb;
      if (query && query.trim().length > 0) {
        req += '?query=' + query;
      }
      this.afbService.Send(api + '/' + verb, query).subscribe(d => {
        this.questions.unshift(this.afbService.syntaxHighlight(req));
        this._questionsSubject.next(this.questions);
        const outcome = (d.request.status === 'success') ? ': OK :' : ': ERROR :';
        const res = [this.count + outcome + this.afbService.syntaxHighlight(d)];
        this.responses.unshift(res);
        this._responsesSubject.next(this.responses);
        this.count++;
      });
    } else {
      this.toastrService.show('Websocket or binding disconnected, request unsendable');
    }
  }

  setQuery(i: any, j: any, k: any, call: string) {
    if (!this.query[i]) {
      this.query[i] = [];
    }
    if (!this.query[i][j]) {
      this.query[i][j] = [];
    }
    if (!this.query[i][j][k]) {
      if (call === 'info') {
        this.query[i][j][k] = '';
      } else {
        this.query[i][j][k] = '';
      }
    }
  }

  getAction(action: string) {
    return `{"action": "${action}"}`;
  }

  getUsage(verb: any, usage: any): string {
    let data: string = !verb ? JSON.stringify(usage) : (!verb.data ? JSON.stringify(usage) : JSON.stringify(verb.data));
    if (data === '{}') {
      data = 'use your query with {} or [] or "" or number';
    }
    return data;
  }

  getExample(verb: any): string {
    const example: string = JSON.stringify(verb);
    return example;
  }

  resetResponses() {
    this.responses = [];
    this._responsesSubject.next(this.responses);
  }

  resetQuestions() {
    this.questions = [];
    this._questionsSubject.next(this.questions);
  }

  resetEvents() {
    this._eventArray = [];
    this._eventSubject.next(this._eventArray);
  }

  copyToClipboard(text) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    const d = document.createElement('div');
    d.innerHTML = text;
    text = d.innerText.replace(/([,])([\S])/g, '$1\n$2');
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }

  closeSocket() {
    this.afbService.Disconnect();
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }

  popOverToggle($event) {
    $event.stopPropagation();
    this.popover.toggle();
  }

  chooseDisplayMode(mode: string) {
    this.displayMode = mode;
    const element = document.querySelector('.responses nb-card-body') as HTMLElement;

    const displayStyles: { [key: string]: string } = {
      default: 'block',
      line: 'ruby',
      columns: '-webkit-box',
    };

    const displayStyle = displayStyles[mode] || 'block'; // Default to 'block' if mode not found
    this.renderer.setStyle(element, 'display', displayStyle);
  }

}
