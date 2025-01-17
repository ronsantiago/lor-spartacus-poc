/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { OccConfig } from '@spartacus/core';

export abstract class AsmConfig extends OccConfig {
  asm?: {
    agentSessionTimer?: {
      startingDelayInSeconds?: number;
    };
    customerSearch?: {
      maxResults?: number;
    };
    userIdHttpHeader?: {
      /**
       * To fix certain features when a customer agent is emulating a user, we must send a header called
       * "sap-commerce-cloud-user-id" to the backend fetching certain data as the user, rather than the
       * agent. However, the header will break instances of Commerce Cloud who do not allow requests with
       * this header. (For example, the configuration "corsfilter.commercewebservices.allowedHeaders" will
       * need to allow it.)
       *
       * Enabling this feature will send the emulated user's IDs on requests that need it as context.
       */
      enable?: boolean;
    };
  };
}

declare module '@spartacus/core' {
  interface Config extends AsmConfig {}
}
