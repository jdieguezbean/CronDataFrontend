import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

import {SessionStorageService} from 'ngx-webstorage';
import {Observable, of, ReplaySubject} from 'rxjs';
import {catchError, shareReplay, tap} from 'rxjs/operators';
import {StateStorageService} from './state-storage.service';
import {SERVER_API_URL} from '../../app.constants';
import {Account} from '../user/account.model';


@Injectable({providedIn: 'root'})
export class AccountService {
  private userIdentity?: Account | null;
  private authenticationState = new ReplaySubject<Account | null>(1);
  private accountCache$?: Observable<Account | null>;

  constructor(
    private sessionStorage: SessionStorageService,
    private http: HttpClient,
    private stateStorageService: StateStorageService,
    private router: Router
  ) {
  }

  save(account: Account): Observable<{}> {
    return this.http.post(SERVER_API_URL + 'api/account', account);
  }

  authenticate(identity: Account | null): void {
    this.userIdentity = identity;
    this.authenticationState.next(this.userIdentity);
  }

  hasAnyAuthority(authorities: string[] | string): boolean {
    if (!this.userIdentity || !this.userIdentity.authorities) {
      return false;
    }
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return this.userIdentity.authorities.some((authority: string) => authorities.includes(authority));
  }

  identity(force?: boolean): Observable<Account | null> {
    if (!this.accountCache$ || force || !this.isAuthenticated()) {
      this.accountCache$ = this.fetch().pipe(
        catchError(() => {
          return of(null);
        }),
        tap((account: Account | null) => {
          this.authenticate(account);

          // After retrieve the account info, the language will be changed to
          // the user's preferred language configured in the account setting
          if (account && account.langKey) {
            // const langKey = this.sessionStorage.retrieve('locale') || account.langKey;
            // this.languageService.changeLanguage(langKey);
          }

          if (account) {
            this.navigateToStoredUrl();
          }
        }),
        shareReplay()
      );
    }
    return this.accountCache$;
  }

  isAuthenticated(): boolean {
    return this.userIdentity !== null;
  }

  getAuthenticationState(): Observable<Account | null> {
    return this.authenticationState.asObservable();
  }

  private fetch(): Observable<Account> {
    return this.http.get<Account>(SERVER_API_URL + 'api/account');
  }

  private navigateToStoredUrl(): void {
    // previousState can be set in the authExpiredInterceptor and in the userRouteAccessService
    // if login is successful, go to stored previousState and clear previousState
    // const previousUrl = this.stateStorageService.getUrl();
    // if (previousUrl) {
    //   this.stateStorageService.clearUrl();
    //   this.router.navigateByUrl(previousUrl);
    // }
  }
}
