// Angular
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
// RxJS
import {filter} from 'rxjs/operators';
// Object-Path
import * as objectPath from 'object-path';
import {LayoutConfigService} from '../../shared/services/layout-config.service';
import {MenuConfigService} from '../../shared/services/menu-config.service';
import {MenuHorizontalService} from '../../shared/services/menu-horizontal.service';
import {HtmlClassService} from '../../shared/services/html-class.service';
import {OffcanvasOptions} from '../../../shared/directives/offcanvas.directive';
import {MenuOptions} from '../../../shared/directives/menu.directive';
import {ADMIN_ROLE} from '../../../shared/constants/global.constant';
import {AccountService} from '../../../core/auth/account.service';


@Component({
  selector: 'app-menu-horizontal',
  templateUrl: './menu-horizontal.component.html',
  styleUrls: ['./menu-horizontal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuHorizontalComponent implements OnInit, AfterViewInit {
  offcanvas: any;
  @ViewChild('headerMenuOffcanvas', {static: true}) headerMenuOffcanvas!: ElementRef;
  adminRole = ADMIN_ROLE;
  @Input() headerLogo!: string;
  @Input() headerMenuSelfDisplay!: boolean;
  @Input() headerMenuClasses!: string;
  // Public properties
  currentRouteUrl: any = '';
  asideSelfDisplay = '';
  rootArrowEnabled!: boolean;

  menuOptions: MenuOptions = {
    submenu: {
      desktop: 'dropdown',
      tablet: 'accordion',
      mobile: 'accordion'
    },
    accordion: {
      slideSpeed: 200, // accordion toggle slide speed in milliseconds
      expandAll: false // allow having multiple expanded accordions in the menu
    },
    dropdown: {
      timeout: 50
    }
  };

  offcanvasOptions: OffcanvasOptions = {
    overlay: true,
    baseClass: 'header-menu-wrapper',
    closeBy: 'kt_header_menu_mobile_close_btn',
    toggleBy: {
      target: 'kt_header_mobile_toggle',
      state: 'mobile-toggle-active'
    }
  };


  constructor(
    private el: ElementRef,
    public htmlClassService: HtmlClassService,
    public menuHorService: MenuHorizontalService,
    private menuConfigService: MenuConfigService,
    private layoutConfigService: LayoutConfigService,
    private router: Router,
    private accountService: AccountService,
    private render: Renderer2,
    private cdr: ChangeDetectorRef
  ) {
  }

  /**
   * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
   */


  /**
   * After view init
   */
  ngAfterViewInit(): void {
  }

  /**
   * On init
   */
  ngOnInit(): void {
    this.rootArrowEnabled = this.layoutConfigService.getConfig('header.menu.self.rootArrow');
    this.currentRouteUrl = this.router.url;
    setTimeout(() => {
      this.offcanvas = new KTOffcanvas(this.headerMenuOffcanvas.nativeElement, this.offcanvasOptions);
    });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.currentRouteUrl = this.router.url;
        this.mobileMenuClose();
        this.cdr.markForCheck();
      });
  }

  /**
   * Return Css Class Name
   * @param item: any
   */
  getItemCssClasses(item: any): string {
    let classes = 'menu-item';

    if (objectPath.get(item, 'submenu')) {
      classes += ' menu-item-submenu';
    }

    if (!item.submenu && this.isMenuItemIsActive(item)) {
      classes += ' menu-item-active menu-item-here';
    }

    if (item.submenu && this.isMenuItemIsActive(item)) {
      classes += ' menu-item-open menu-item-here';
    }

    if (objectPath.get(item, 'resizer')) {
      classes += ' menu-item-resize';
    }

    const menuType = objectPath.get(item, 'submenu.type') || 'classic';
    if ((objectPath.get(item, 'root') && menuType === 'classic')
      || parseInt(objectPath.get(item, 'submenu.width'), 10) > 0) {
      classes += ' menu-item-rel';
    }

    const customClass = objectPath.get(item, 'custom-class');
    if (customClass) {
      classes += ' ' + customClass;
    }

    if (objectPath.get(item, 'icon-only')) {
      classes += ' menu-item-icon-only';
    }

    return classes;
  }

  /**
   * Returns Attribute SubMenu Toggle
   * @param item: any
   */
  getItemAttrSubmenuToggle(item: any): any {
    let toggle = 'hover';
    if (objectPath.get(item, 'toggle') === 'click') {
      toggle = 'click';
    } else if (objectPath.get(item, 'submenu.type') === 'tabs') {
      toggle = 'tabs';
    } else {
      // submenu toggle default to 'hover'
    }

    return toggle;
  }

  /**
   * Returns Submenu CSS Class Name
   * @param item: any
   */
  getItemMenuSubmenuClass(item: any): string {
    let classes = '';

    const alignment = objectPath.get(item, 'alignment') || 'right';

    if (alignment) {
      classes += ' menu-submenu-' + alignment;
    }

    const type = objectPath.get(item, 'type') || 'classic';
    if (type === 'classic') {
      classes += ' menu-submenu-classic';
    }
    if (type === 'tabs') {
      classes += ' menu-submenu-tabs';
    }
    if (type === 'mega') {
      if (objectPath.get(item, 'width')) {
        classes += ' menu-submenu-fixed';
      }
    }

    if (objectPath.get(item, 'pull')) {
      classes += ' menu-submenu-pull';
    }

    return classes;
  }

  /**
   * Check Menu is active
   * @param item: any
   */
  isMenuItemIsActive(item: any): boolean {
    if (item.submenu) {
      return this.isMenuRootItemIsActive(item);
    }

    if (!item.page) {
      return false;
    }

    return this.currentRouteUrl.indexOf(item.page) !== -1;
  }

  /**
   * Check Menu Root Item is active
   * @param item: any
   */
  isMenuRootItemIsActive(item: any): boolean {
    if (item.submenu.items) {
      for (const subItem of item.submenu.items) {
        if (this.isMenuItemIsActive(subItem)) {
          return true;
        }
      }
    }

    if (item.submenu.columns) {
      for (const subItem of item.submenu.columns) {
        if (this.isMenuItemIsActive(subItem)) {
          return true;
        }
      }
    }

    if (typeof item.submenu[Symbol.iterator] === 'function') {
      for (const subItem of item.submenu) {
        const active = this.isMenuItemIsActive(subItem);
        if (active) {
          return true;
        }
      }
    }

    return false;
  }

  mobileMenuClose(): void {
    if (KTUtil.isBreakpointDown('lg') && this.offcanvas) { // Tablet and mobile mode
      this.offcanvas.hide(); // Hide offcanvas after general link click
    }
  }

  canView(authorities: string[] | string): any {
    return this.accountService.hasAnyAuthority(authorities);
  }
}
