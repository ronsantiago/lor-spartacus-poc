import { NgModule } from '@angular/core';
import {
  wishListTranslationChunksConfig,
  wishListTranslations,
} from '@spartacus/cart/wish-list/assets';
import {
  CART_WISH_LIST_FEATURE,
  WishListRootModule,
} from '@spartacus/cart/wish-list/root';
import { I18nConfig, provideConfig } from '@spartacus/core';

@NgModule({
  imports: [WishListRootModule],
  providers: [
    provideConfig({
      featureModules: {
        [CART_WISH_LIST_FEATURE]: {
          module: () =>
            import('@spartacus/cart/wish-list').then((m) => m.WishListModule),
        },
      },
    }),
    provideConfig(<I18nConfig>{
      i18n: {
        resources: wishListTranslations,
        chunks: wishListTranslationChunksConfig,
        fallbackLang: 'en',
      },
    }),
  ],
})
export class WishListFeatureModule {}