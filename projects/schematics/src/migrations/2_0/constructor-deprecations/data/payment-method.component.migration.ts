import {
  ACTIVATED_ROUTE,
  ACTIVE_CART_SERVICE,
  ANGULAR_ROUTER,
  CART_SERVICE,
  CHECKOUT_CONFIG_SERVICE,
  CHECKOUT_DELIVERY_SERVICE,
  CHECKOUT_PAYMENT_SERVICE,
  CHECKOUT_SERVICE,
  GLOBAL_MESSAGE_SERVICE,
  PAYMENT_METHOD_COMPONENT,
  ROUTING_SERVICE,
  SPARTACUS_CORE,
  SPARTACUS_STOREFRONTLIB,
  TRANSLATION_SERVICE,
  USER_PAYMENT_SERVICE,
} from '../../../../shared/constants';
import { ConstructorDeprecation } from '../../../../shared/utils/file-utils';

export const PAYMENT_METHOD_COMPONENT_MIGRATIONS: ConstructorDeprecation[] = [
  // projects/storefrontlib/src/cms-components/checkout/components/payment-method/payment-method.component.ts
  {
    class: PAYMENT_METHOD_COMPONENT,
    importPath: SPARTACUS_STOREFRONTLIB,
    deprecatedParams: [
      {
        className: USER_PAYMENT_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_DELIVERY_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_PAYMENT_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: GLOBAL_MESSAGE_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: ROUTING_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_CONFIG_SERVICE,
        importPath: SPARTACUS_STOREFRONTLIB,
      },
      {
        className: ACTIVATED_ROUTE,
        importPath: ANGULAR_ROUTER,
      },
      {
        className: TRANSLATION_SERVICE,
        importPath: SPARTACUS_CORE,
      },
    ],
    addParams: [
      {
        className: ACTIVE_CART_SERVICE,
        importPath: SPARTACUS_CORE,
      },
    ],
  },
  {
    class: PAYMENT_METHOD_COMPONENT,
    importPath: SPARTACUS_STOREFRONTLIB,
    deprecatedParams: [
      {
        className: USER_PAYMENT_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_DELIVERY_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_PAYMENT_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: GLOBAL_MESSAGE_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: ROUTING_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CHECKOUT_CONFIG_SERVICE,
        importPath: SPARTACUS_STOREFRONTLIB,
      },
      {
        className: ACTIVATED_ROUTE,
        importPath: ANGULAR_ROUTER,
      },
      {
        className: TRANSLATION_SERVICE,
        importPath: SPARTACUS_CORE,
      },
      {
        className: CART_SERVICE,
        importPath: SPARTACUS_CORE,
      },
    ],
    removeParams: [
      {
        className: CART_SERVICE,
        importPath: SPARTACUS_CORE,
      },
    ],
    addParams: [
      {
        className: ACTIVE_CART_SERVICE,
        importPath: SPARTACUS_CORE,
      },
    ],
  },
];
