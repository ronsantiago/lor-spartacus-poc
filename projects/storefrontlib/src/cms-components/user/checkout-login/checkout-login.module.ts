import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CmsConfig, I18nModule, provideDefaultConfig } from '@spartacus/core';
import { FormErrorsModule } from '../../../shared/index';
import { NotCheckoutAuthGuard } from '../../checkout/guards/not-checkout-auth.guard';
import { CheckoutLoginComponent } from './checkout-login.component';

/**
 * @deprecated since 4.0, use checkout feature lib instead.
 */
@NgModule({
  imports: [
    CommonModule,
    I18nModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    FormErrorsModule,
  ],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        GuestCheckoutLoginComponent: {
          component: CheckoutLoginComponent,
          guards: [NotCheckoutAuthGuard],
        },
      },
    }),
  ],
  declarations: [CheckoutLoginComponent],
  exports: [CheckoutLoginComponent],
  entryComponents: [CheckoutLoginComponent],
})
export class CheckoutLoginModule {}
