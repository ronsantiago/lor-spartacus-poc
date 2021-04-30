import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActiveCartService, Cart } from '@spartacus/core';
import { Observable } from 'rxjs';

/**
 * @deprecated since 4.0, use checkout feature lib instead.
 */
@Component({
  selector: 'cx-checkout-order-summary',
  templateUrl: './checkout-order-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutOrderSummaryComponent {
  cart$: Observable<Cart>;

  constructor(protected activeCartService: ActiveCartService) {
    this.cart$ = this.activeCartService.getActive();
  }
}
