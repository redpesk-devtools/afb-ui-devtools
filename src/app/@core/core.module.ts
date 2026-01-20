import { ModuleWithProviders, NgModule, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { AnalyticsService } from './utils';
import { MockDataModule } from './mock/mock-data.module';
import { NbTooltipModule } from '@nebular/theme';

export const NB_CORE_PROVIDERS = [
  ...MockDataModule.forRoot().providers,
  AnalyticsService,
];

@NgModule({
  imports: [
    CommonModule,
    NbTooltipModule,
  ],
  exports: [],
  declarations: [],
})
export class CoreModule {
  constructor() {
    const parentModule = inject(CoreModule, { optional: true, skipSelf: true });

    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
      ],
    };
  }
}
