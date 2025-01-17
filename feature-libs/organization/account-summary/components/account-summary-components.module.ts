import { NgModule } from '@angular/core';
import { AccountSummaryDocumentModule } from './details/document/account-summary-document.module';
import { AccountSummaryHeaderModule } from './details/header/account-summary-header.module';
import { AccountSummaryListModule } from './list/account-summary-list.module';

@NgModule({
  imports: [
    AccountSummaryListModule,
    AccountSummaryHeaderModule,
    AccountSummaryDocumentModule,
  ],
})
export class AccountSummaryComponentsModule {}
