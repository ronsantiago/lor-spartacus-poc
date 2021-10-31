import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  CheckoutDeliveryModesFacade,
  CheckoutQueryFacade,
  DeliveryModeClearedEvent,
  DeliveryModeSetEvent,
  ReloadDeliveryModesEvent,
  ResetDeliveryModesEvent,
} from '@spartacus/checkout/base/root';
import {
  ActiveCartService,
  CartActions,
  Command,
  CommandService,
  CommandStrategy,
  CurrencySetEvent,
  DeliveryMode,
  EventService,
  LanguageSetEvent,
  LoginEvent,
  LogoutEvent,
  OCC_USER_ID_ANONYMOUS,
  Query,
  QueryNotifier,
  QueryService,
  QueryState,
  StateWithMultiCart,
  UserIdService,
} from '@spartacus/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { CheckoutDeliveryModesConnector } from '../connectors/delivery-modes/checkout-delivery-modes.connector';

@Injectable()
export class CheckoutDeliveryModesService
  implements CheckoutDeliveryModesFacade
{
  protected retrySupportedDeliveryModes$: Subject<boolean> =
    new Subject<boolean>();

  protected getSupportedDeliveryModesReloadTriggers(): QueryNotifier[] {
    return [ReloadDeliveryModesEvent, ...this.getSiteContextTriggers()];
  }

  protected getSiteContextTriggers(): QueryNotifier[] {
    return [LanguageSetEvent, CurrencySetEvent];
  }

  protected getSupportedDeliveryModesResetTriggers(): QueryNotifier[] {
    return [
      ResetDeliveryModesEvent,
      ...this.getAuthTriggers(),
      this.retrySupportedDeliveryModes$.asObservable(),
    ];
  }

  protected getAuthTriggers(): QueryNotifier[] {
    return [LogoutEvent, LoginEvent];
  }

  protected supportedDeliveryModesQuery: Query<DeliveryMode[]> =
    this.query.create<DeliveryMode[]>(
      () =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]) =>
            this.checkoutDeliveryModesConnector.getSupportedModes(
              userId,
              cartId
            )
          )
        ),
      {
        reloadOn: this.getSupportedDeliveryModesReloadTriggers(),
        resetOn: this.getSupportedDeliveryModesResetTriggers(),
      }
    );

  protected setDeliveryModeCommand: Command<string, unknown> =
    this.command.create<string>(
      (deliveryModeCode) =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]) => {
            if (!deliveryModeCode) {
              throw new Error('Checkout conditions not met');
            }

            return this.checkoutDeliveryModesConnector
              .setMode(userId, cartId, deliveryModeCode)
              .pipe(
                tap(() => {
                  this.eventService.dispatch(
                    {
                      userId,
                      cartId,
                      deliveryModeCode,
                    },
                    DeliveryModeSetEvent
                  );
                  this.store.dispatch(
                    new CartActions.LoadCart({
                      userId,
                      cartId,
                    })
                  );
                })
              );
          })
        ),
      {
        strategy: CommandStrategy.CancelPrevious,
      }
    );

  protected clearDeliveryModeCommand: Command<void, unknown> =
    this.command.create<void>(
      () =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]) =>
            this.checkoutDeliveryModesConnector
              .clearCheckoutDeliveryMode(userId, cartId)
              .pipe(
                tap(() => {
                  this.eventService.dispatch(
                    {
                      userId,
                      cartId,
                    },
                    DeliveryModeClearedEvent
                  );
                  this.store.dispatch(
                    new CartActions.LoadCart({
                      cartId,
                      userId,
                    })
                  );
                }),
                catchError((err) => {
                  // TODO: Why we do it?
                  this.store.dispatch(
                    new CartActions.LoadCart({
                      cartId,
                      userId,
                    })
                  );
                  throw err;
                })
              )
          )
        ),
      {
        strategy: CommandStrategy.CancelPrevious,
      }
    );

  constructor(
    protected store: Store<StateWithMultiCart>,
    protected activeCartService: ActiveCartService,
    protected userIdService: UserIdService,
    protected eventService: EventService,
    protected query: QueryService,
    protected command: CommandService,
    protected checkoutDeliveryModesConnector: CheckoutDeliveryModesConnector,
    protected checkoutQuery: CheckoutQueryFacade
  ) {}

  protected checkoutPreconditions(): Observable<[string, string]> {
    return combineLatest([
      this.userIdService.takeUserId(),
      this.activeCartService.takeActiveCartId(),
    ]).pipe(
      take(1),
      map(([userId, cartId]) => {
        if (
          !userId ||
          !cartId ||
          (userId === OCC_USER_ID_ANONYMOUS &&
            !this.activeCartService.isGuestCart())
        ) {
          throw new Error('Checkout conditions not met');
        }
        return [userId, cartId];
      })
    );
  }

  /**
   * Get supported delivery modes
   */
  getSupportedDeliveryModes(): Observable<DeliveryMode[]> {
    return this.getSupportedDeliveryModesState().pipe(
      map((deliveryModesState) => deliveryModesState.data ?? [])
    );
  }

  getSupportedDeliveryModesState(): Observable<QueryState<DeliveryMode[]>> {
    return this.supportedDeliveryModesQuery.getState().pipe(
      // TODO: check if we need to do error handling here. This mimics the behaviour from delivery-mode.component.ts' ngOnInit().
      tap((deliveryModesState) => {
        if (deliveryModesState.error && !deliveryModesState.loading) {
          this.retrySupportedDeliveryModes$.next();
          // TODO: Add fancy exponential back-off retry query as example of how not to do infinite loop
        }
      })
    );
  }

  /**
   * Get selected delivery mode
   */
  getSelectedDeliveryMode(): Observable<QueryState<DeliveryMode | undefined>> {
    return this.checkoutQuery
      .getCheckoutDetailsState()
      .pipe(map((state) => ({ ...state, data: state.data?.deliveryMode })));
  }

  /**
   * Set delivery mode
   * @param mode : The delivery mode to be set
   */
  setDeliveryMode(mode: string): Observable<unknown> {
    return this.setDeliveryModeCommand.execute(mode);
  }

  /**
   * Clear selected delivery mode setup in last checkout process
   */
  clearCheckoutDeliveryMode(): Observable<unknown> {
    return this.clearDeliveryModeCommand.execute();
  }
}