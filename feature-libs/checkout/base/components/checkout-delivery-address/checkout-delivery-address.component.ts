import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import {
  CheckoutDeliveryAddressFacade,
  CheckoutDeliveryModesFacade,
} from '@spartacus/checkout/base/root';
import {
  Address,
  getLastValueSync,
  GlobalMessageService,
  GlobalMessageType,
  TranslationService,
  UserAddressService,
} from '@spartacus/core';
import { Card } from '@spartacus/storefront';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { CheckoutStepService } from '../services/checkout-step.service';

export interface CardWithAddress {
  card: Card;
  address: Address;
}

@Component({
  selector: 'cx-delivery-address',
  templateUrl: './checkout-delivery-address.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutDeliveryAddressComponent implements OnInit {
  protected busy$ = new BehaviorSubject<boolean>(false);

  cards$: Observable<CardWithAddress[]>;

  addressFormOpened = false;
  shouldRedirect = false; // this helps with smoother steps transition
  doneAutoSelect = false;

  isUpdating$: Observable<boolean> = combineLatest([
    this.busy$,
    this.userAddressService.getAddressesLoading(),
    this.checkoutDeliveryAddressFacade
      .getDeliveryAddressState()
      .pipe(map((state) => state.loading)),
  ]).pipe(
    map(
      ([busy, userAddressLoading, deliveryAddressLoading]) =>
        busy || userAddressLoading || deliveryAddressLoading
    ),
    distinctUntilChanged()
  );

  get isGuestCheckout(): boolean {
    return !!getLastValueSync(this.activeCartFacade.isGuestCart());
  }

  get backBtnText(): string {
    return this.checkoutStepService.getBackBntText(this.activatedRoute);
  }

  get selectedAddress$(): Observable<Address | undefined> {
    console.log('selectedAddress$');
    return this.checkoutDeliveryAddressFacade.getDeliveryAddressState().pipe(
      filter((state) => !state.loading),
      map((state) => state.data),
      tap((address) => {
        if (address && this.shouldRedirect) {
          this.next();
        }
      })
    );
  }

  constructor(
    protected userAddressService: UserAddressService,
    protected checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
    protected activatedRoute: ActivatedRoute,
    protected translationService: TranslationService,
    protected activeCartFacade: ActiveCartFacade,
    protected checkoutStepService: CheckoutStepService,
    protected checkoutDeliveryModesFacade: CheckoutDeliveryModesFacade,
    protected globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    if (!this.isGuestCheckout) {
      this.userAddressService.loadAddresses();
    }

    this.cards$ = combineLatest([
      this.getSupportedAddresses(),
      this.selectedAddress$,
      this.translationService.translate(
        'checkoutAddress.defaultDeliveryAddress'
      ),
      this.translationService.translate('checkoutAddress.shipToThisAddress'),
      this.translationService.translate('addressCard.selected'),
    ]).pipe(
      switchMap(
        ([addresses, selected, textDefault, textShipTo, textSelected]) =>
          this.selectDefaultAddress(addresses, selected).pipe(
            map(() =>
              addresses.map((address) => ({
                address,
                card: this.getCardContent(
                  address,
                  selected,
                  textDefault,
                  textShipTo,
                  textSelected
                ),
              }))
            )
          )
      )
    );
  }

  getSupportedAddresses(): Observable<Address[]> {
    console.log('getSupportedAddresses');
    return this.userAddressService.getAddresses();
  }

  selectDefaultAddress(
    addresses: Address[],
    selected: Address | undefined
  ): Observable<unknown> {
    let selection$: Observable<unknown> = of();
    if (
      !this.doneAutoSelect &&
      addresses?.length &&
      (!selected || Object.keys(selected).length === 0)
    ) {
      selected = addresses.find((address) => address.defaultAddress);
      if (selected) {
        selection$ = this.setAddress(selected);
      }
      this.doneAutoSelect = true;
    }
    return selection$;
  }

  getCardContent(
    address: Address,
    selected: any,
    textDefaultDeliveryAddress: string,
    textShipToThisAddress: string,
    textSelected: string
  ): Card {
    let region = '';
    if (address.region && address.region.isocode) {
      region = address.region.isocode + ', ';
    }

    return {
      title: address.defaultAddress ? textDefaultDeliveryAddress : '',
      textBold: address.firstName + ' ' + address.lastName,
      text: [
        address.line1,
        address.line2,
        address.town + ', ' + region + address.country?.isocode,
        address.postalCode,
        address.phone,
      ],
      actions: [{ name: textShipToThisAddress, event: 'send' }],
      header: selected && selected.id === address.id ? textSelected : '',
      label: address.defaultAddress
        ? 'addressBook.defaultDeliveryAddress'
        : 'addressBook.additionalDeliveryAddress',
    } as Card;
  }

  selectAddress(address: Address): void {
    this.globalMessageService.add(
      {
        key: 'checkoutAddress.deliveryAddressSelected',
      },
      GlobalMessageType.MSG_TYPE_INFO
    );

    this.setAddress(address);
  }

  addAddress(address: Address | undefined): void {
    if (!address) {
      this.shouldRedirect = false;
      this.next();
      return;
    }

    this.busy$.next(true);

    this.checkoutDeliveryAddressFacade
      .createAndSetAddress(address)
      .pipe(
        switchMap(() =>
          this.checkoutDeliveryModesFacade.clearCheckoutDeliveryMode()
        )
      )
      .subscribe({
        complete: () => {
          this.onSuccess();
          this.shouldRedirect = true;
        },
        error: () => {
          this.onError();
          this.shouldRedirect = false;
        },
      });
  }

  showNewAddressForm(): void {
    this.addressFormOpened = true;
  }

  hideNewAddressForm(goPrevious: boolean = false): void {
    this.addressFormOpened = false;
    if (goPrevious) {
      this.back();
    }
  }

  next(): void {
    this.checkoutStepService.next(this.activatedRoute);
  }

  back(): void {
    this.checkoutStepService.back(this.activatedRoute);
  }

  protected setAddress(address: Address): Observable<unknown> {
    this.busy$.next(true);
    return this.checkoutDeliveryAddressFacade.setDeliveryAddress(address).pipe(
      switchMap(() =>
        this.checkoutDeliveryModesFacade.clearCheckoutDeliveryMode()
      ),
      tap({
        complete: () => {
          this.onSuccess();
        },
        error: () => {
          this.onError();
        },
      })
    );
  }

  protected onSuccess(): void {
    this.busy$.next(false);
  }

  protected onError(): void {
    this.busy$.next(false);
  }
}