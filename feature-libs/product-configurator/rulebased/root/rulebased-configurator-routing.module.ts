/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  provideDefaultConfig,
  RoutingModule as CoreRoutingModule,
} from '@spartacus/core';
import { CmsRouteModule } from '@spartacus/storefront';
import { defaultRulebasedRoutingConfig } from './default-rulebased-routing-config';

/**
 * Provides the default cx routing configuration for the rulebased configurator
 */
@NgModule({
  imports: [CoreRoutingModule.forRoot(), CmsRouteModule],
})
export class RulebasedConfiguratorRoutingModule {
  static forRoot(): ModuleWithProviders<RulebasedConfiguratorRoutingModule> {
    return {
      ngModule: RulebasedConfiguratorRoutingModule,
      providers: [provideDefaultConfig(defaultRulebasedRoutingConfig)],
    };
  }
}
