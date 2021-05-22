// Angular
import {Injectable} from '@angular/core';
// RxJS
import {BehaviorSubject} from 'rxjs';
// Object path
import * as objectPath from 'object-path';
import {MenuConfigService} from "../../layout/shared/services/menu-config.service";

// Services


@Injectable({providedIn: 'root'})
export class MenuAsideService {
  // Public properties
  menuList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  /**
   * Service constructor
   *
   * @param menuConfigService: MenuConfigService
   */
  constructor(private menuConfigService: MenuConfigService) {
    this.loadMenu();
  }

  /**
   * Load menu list
   */
  loadMenu() {
    // get menu list
    const menuItems: any[] = objectPath.get(this.menuConfigService.getMenus(), 'aside.items');
    this.menuList$.next(menuItems);
  }
}
