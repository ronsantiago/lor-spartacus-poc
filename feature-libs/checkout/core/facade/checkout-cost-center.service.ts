import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  ActiveCartService,
  OCC_USER_ID_ANONYMOUS,
  StateWithProcess,
  UserIdService,
} from '@spartacus/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { CheckoutActions } from '../store/actions/index';
import { StateWithCheckout } from '../store/checkout-state';
import { CheckoutSelectors } from '../store/selectors/index';

@Injectable()
export class CheckoutCostCenterService {
  constructor(
    protected checkoutStore: Store<StateWithCheckout | StateWithProcess<void>>,
    protected activeCartService: ActiveCartService,
    protected userIdService: UserIdService
  ) {}

  /**
   * Set cost center to cart
   * @param costCenterId : cost center id
   */
  setCostCenter(costCenterId: string): void {
    let cartId;
    this.activeCartService
      .getActiveCartId()
      .pipe(take(1))
      .subscribe((activeCartId) => (cartId = activeCartId));

    this.userIdService.invokeWithUserId((userId) => {
      if (userId && userId !== OCC_USER_ID_ANONYMOUS && cartId) {
        this.checkoutStore.dispatch(
          new CheckoutActions.SetCostCenter({
            userId: userId,
            cartId: cartId,
            costCenterId: costCenterId,
          })
        );
      }
    });
  }

  /**
   * Get cost center id from cart
   */
  getCostCenter(): Observable<string> {
    return combineLatest([
      this.activeCartService.getActive(),
      this.checkoutStore.pipe(select(CheckoutSelectors.getCostCenter)),
    ]).pipe(
      filter(([cart]) => Boolean(cart)),
      map(([cart, costCenterId]) => {
        if (costCenterId === undefined && cart.costCenter) {
          costCenterId = cart.costCenter.code;
          this.checkoutStore.dispatch(
            new CheckoutActions.SetCostCenterSuccess(cart.costCenter.code)
          );
        }
        return costCenterId;
      })
    );
  }
}
