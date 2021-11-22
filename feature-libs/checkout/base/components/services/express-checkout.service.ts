import { Injectable } from '@angular/core';
import {
  CheckoutDeliveryAddressFacade,
  CheckoutDeliveryModesFacade,
  CheckoutPaymentFacade,
} from '@spartacus/checkout/base/root';
import { UserAddressService, UserPaymentService } from '@spartacus/core';
import { combineLatest, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { CheckoutConfigService } from '../services/checkout-config.service';

@Injectable({
  providedIn: 'root',
})
export class ExpressCheckoutService {
  private shippingAddressSet$: Observable<boolean>;
  private deliveryModeSet$: Observable<boolean>;
  private paymentMethodSet$: Observable<boolean>;

  constructor(
    protected userAddressService: UserAddressService,
    protected userPaymentService: UserPaymentService,
    protected checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
    protected checkoutPaymentFacade: CheckoutPaymentFacade,
    protected checkoutConfigService: CheckoutConfigService,
    protected checkoutDeliveryModesFacade: CheckoutDeliveryModesFacade
  ) {
    this.setShippingAddress();
    this.setDeliveryMode();
    this.setPaymentMethod();
  }

  protected setShippingAddress(): void {
    this.shippingAddressSet$ = combineLatest([
      this.userAddressService.getAddresses(),
      this.userAddressService.getAddressesLoadedSuccess(),
    ]).pipe(
      debounceTime(0),
      tap(([, addressesLoadedSuccess]) => {
        if (!addressesLoadedSuccess) {
          this.userAddressService.loadAddresses();
        }
      }),
      filter(([, addressesLoadedSuccess]) => addressesLoadedSuccess),
      take(1),
      switchMap(([addresses]) => {
        const defaultAddress =
          addresses.find((address) => address.defaultAddress) || addresses[0];
        if (defaultAddress && Object.keys(defaultAddress).length) {
          return this.checkoutDeliveryAddressFacade
            .setDeliveryAddress(defaultAddress)
            .pipe(
              switchMap(() =>
                this.checkoutDeliveryAddressFacade.getDeliveryAddressState()
              ),
              filter((state) => !state.error && !state.loading),
              map((state) => state.data),
              map((data) => !!(data && Object.keys(data).length)),
              catchError(() => of(false))
            );
        }
        return of(false);
      })
    );
  }

  protected setDeliveryMode(): void {
    this.deliveryModeSet$ = combineLatest([
      this.shippingAddressSet$,
      this.checkoutDeliveryModesFacade.getSupportedDeliveryModesState(),
    ]).pipe(
      debounceTime(0),
      switchMap(([addressSet, supportedDeliveryModesState]) => {
        if (!addressSet) {
          return of(false);
        }
        return of([supportedDeliveryModesState]).pipe(
          filter(
            ([supportedDeliveryModesState]) =>
              !supportedDeliveryModesState.loading &&
              !!supportedDeliveryModesState.data?.length
          ),
          switchMap(([deliveryModesState]) => {
            if (!deliveryModesState.data) {
              return of(false);
            }
            const preferredDeliveryMode =
              this.checkoutConfigService.getPreferredDeliveryMode(
                deliveryModesState.data
              );
            return of([preferredDeliveryMode]).pipe(
              switchMap(([deliveryMode]) => {
                if (!deliveryMode) {
                  return of(false);
                }
                return this.checkoutDeliveryModesFacade
                  .setDeliveryMode(deliveryMode)
                  .pipe(
                    switchMap(() =>
                      this.checkoutDeliveryModesFacade.getSelectedDeliveryModeState()
                    ),
                    filter((state) => !state.error && !state.loading),
                    map((state) => state.data),
                    map((data) => !!(data && Object.keys(data).length)),
                    catchError(() => of(false))
                  );
              })
            );
          })
        );
      })
    );
  }

  protected setPaymentMethod(): void {
    this.paymentMethodSet$ = combineLatest([
      this.userPaymentService.getPaymentMethods(),
      this.userPaymentService.getPaymentMethodsLoadedSuccess(),
    ]).pipe(
      debounceTime(0),
      tap(([, paymentMethodsLoadedSuccess]) => {
        if (!paymentMethodsLoadedSuccess) {
          this.userPaymentService.loadPaymentMethods();
        }
      }),
      filter(([, success]) => success),
      switchMap(([payments]) => {
        const defaultPayment =
          payments.find((address) => address.defaultPayment) || payments[0];
        if (!defaultPayment || Object.keys(defaultPayment).length === 0) {
          return of(false);
        }
        return this.checkoutPaymentFacade
          .setPaymentDetails(defaultPayment)
          .pipe(
            switchMap(() =>
              this.checkoutPaymentFacade.getPaymentDetailsState()
            ),
            filter((state) => !state.error && !state.loading),
            map((state) => state.data),
            map((data) => !!(data && Object.keys(data).length)),
            catchError(() => of(false))
          );
      })
    );
  }

  public trySetDefaultCheckoutDetails(): Observable<boolean> {
    return combineLatest([this.deliveryModeSet$, this.paymentMethodSet$]).pipe(
      map(
        ([deliveryModeSet, paymentMethodSet]) =>
          deliveryModeSet && paymentMethodSet
      )
    );
  }
}