import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CheckoutStep } from '../../model/checkout-step.model';
import { CheckoutStepService } from '../../services/checkout-step.service';

/**
 * @deprecated since 4.0, use checkout feature lib instead.
 */
@Component({
  selector: 'cx-checkout-progress',
  templateUrl: './checkout-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutProgressComponent {
  private _steps$: BehaviorSubject<CheckoutStep[]> = this.checkoutStepService
    .steps$;

  constructor(protected checkoutStepService: CheckoutStepService) {}

  activeStepIndex: number;
  activeStepIndex$: Observable<number> = this.checkoutStepService.activeStepIndex$.pipe(
    tap((index) => (this.activeStepIndex = index))
  );

  get steps$(): Observable<CheckoutStep[]> {
    return this._steps$.asObservable();
  }

  getTabIndex(stepIndex: number): number {
    return !this.isActive(stepIndex) && !this.isDisabled(stepIndex) ? 0 : -1;
  }

  isActive(index: number): boolean {
    return index === this.activeStepIndex;
  }

  isDisabled(index: number): boolean {
    return index > this.activeStepIndex;
  }
}
