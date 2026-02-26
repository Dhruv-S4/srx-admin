import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  signal,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TabOption } from '../../../core/models/common.model';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [NgClass, NgIcon],
  templateUrl: './tabs.html',
  styles: [],
})
export class Tabs implements OnInit, AfterViewInit {
  @Input({ required: true }) tabs: TabOption[] = [];
  /** 1 = line (underline indicator), 2 = block (pill style) */
  @Input() tabType: 1 | 2 = 1;
  @Output() tabSelected = new EventEmitter<TabOption>();

  @ViewChildren('tabButton') tabButtons!: QueryList<ElementRef>;
  indicatorWidth = signal(0);
  indicatorPosition = signal(0);

  ngOnInit() {
    const activeTabIndex = this.tabs.findIndex((tab) => tab.active);
    if (this.tabs.length > 0) {
      this.selectTab(activeTabIndex >= 0 ? activeTabIndex : 0);
    }
  }

  selectTab(index: number) {
    this.tabs.forEach((tab, i) => {
      tab.active = i === index;
    });

    setTimeout(() => {
      const activeButton = this.tabButtons?.get(index)?.nativeElement;
      if (activeButton) {
        this.indicatorWidth.set(activeButton.offsetWidth);
        this.indicatorPosition.set(activeButton.offsetLeft);
      }
    });

    this.tabSelected.emit(this.tabs[index]);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const activeIndex = this.tabs.findIndex((tab) => tab.active);
      const idx = activeIndex >= 0 ? activeIndex : 0;
      const activeButton = this.tabButtons?.get(idx)?.nativeElement;
      if (activeButton) {
        this.indicatorWidth.set(activeButton.offsetWidth);
        this.indicatorPosition.set(activeButton.offsetLeft);
      }
    });
  }
}
