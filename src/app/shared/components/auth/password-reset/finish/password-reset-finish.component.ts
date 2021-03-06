import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {LoginModalService} from '../../../../../core/login/login-modal.service';
import {PasswordResetFinishService} from './password-reset-finish.service';

@Component({
  selector: 'app-password-reset-finish',
  templateUrl: './password-reset-finish.component.html',
  styleUrls: ['password-reset.scss']
})
export class PasswordResetFinishComponent implements OnInit, AfterViewInit {
  @ViewChild('newPassword', {static: false})
  newPassword?: ElementRef;

  initialized = false;
  doNotMatch = false;
  error = false;
  success = false;
  key = '';

  passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
  });
  reseting = false;

  constructor(
    private passwordResetFinishService: PasswordResetFinishService,
    private loginModalService: LoginModalService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.key) {
        this.key = params.key;
      }
      this.initialized = true;
    });
  }

  ngAfterViewInit(): void {
    if (this.newPassword) {
      this.newPassword.nativeElement.focus();
    }
  }

  finishReset(): void {
    this.doNotMatch = false;
    this.error = false;
    this.reseting = true;
    // @ts-ignore
    const newPassword = this.passwordForm.get(['newPassword']).value;
    // @ts-ignore
    const confirmPassword = this.passwordForm.get(['confirmPassword']).value;

    if (newPassword !== confirmPassword) {
      this.doNotMatch = true;
    } else {
      this.passwordResetFinishService.save(this.key, newPassword).subscribe(
        () => {
          this.success = true;
          this.reseting = false;
        },
        () => {
          this.error = true;
          this.reseting = false;
        }
      );
    }
  }

  login(): void {
    this.loginModalService.open();
  }
}
