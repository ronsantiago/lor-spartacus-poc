import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  CmsConfig,
  I18nModule,
  provideDefaultConfig,
  UrlModule,
} from '@spartacus/core';

import { ProgressButtonModule } from '../../../shared/components/progress-button/progress-button.module';
import { CartProceedToCheckoutComponent } from './cart-proceed-to-checkout.component';

@NgModule({
  imports: [
    CommonModule,
    I18nModule,
    ProgressButtonModule,
    UrlModule,
  ],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        CartProceedToCheckoutComponent: {
          component: CartProceedToCheckoutComponent,
        },
      },
    }),
  ],
  declarations: [CartProceedToCheckoutComponent],
  exports: [CartProceedToCheckoutComponent],
})
export class CartProceedToCheckoutModule {}