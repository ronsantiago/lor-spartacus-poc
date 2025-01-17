import { DIALOG_TYPE, LayoutConfig } from '@spartacus/storefront';
import { AddedToCartDialogComponent } from './added-to-cart-dialog.component';

export const defaultAddedToCartLayoutConfig: LayoutConfig = {
  launch: {
    ADDED_TO_CART: {
      inlineRoot: true,
      component: AddedToCartDialogComponent,
      dialogType: DIALOG_TYPE.DIALOG,
    },
  },
};
