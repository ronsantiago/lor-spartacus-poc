import { Injectable } from '@angular/core';
import { B2BUnit, RoutingService } from '@spartacus/core';

@Injectable({
  providedIn: 'root',
})
export class AccountSummaryItemService {
  constructor(protected routingService: RoutingService) {}

  launchDetails(item: B2BUnit): void {
    if (item && Object.keys(item).length > 0) {
      this.routingService.go({
        cxRoute: 'orgAccountSummaryDetails',
        params: item,
      });
    }
  }
}
