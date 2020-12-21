/**
 * @license
 * Copyright (C) 2019-2020 IoT.bzh Company
 * Contact: https://www.iot.bzh/licensing
 *
 * This file is part of the rp-webserver module of the RedPesk project.
 *
 * $RP_BEGIN_LICENSE$
 * Commercial License Usage
 *  Licensees holding valid commercial IoT.bzh licenses may use this file in
 *  accordance with the commercial license agreement provided with the
 *  Software or, alternatively, in accordance with the terms contained in
 *  a written agreement between you and The IoT.bzh Company. For licensing terms
 *  and conditions see https://www.iot.bzh/terms-conditions. For further
 *  information use the contact form at https://www.iot.bzh/contact.
 *
 * GNU General Public License Usage
 *  Alternatively, this file may be used under the terms of the GNU General
 *  Public license version 3. This license is as published by the Free Software
 *  Foundation and appearing in the file LICENSE.GPLv3 included in the packaging
 *  of this file. Please review the following information to ensure the GNU
 *  General Public License requirements will be met
 *  https://www.gnu.org/licenses/gpl-3.0.html.
 * $RP_END_LICENSE$
 */

import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { CoreComponent } from './core/core.component';
import { NbCardModule, NbButtonModule, NbAccordionModule, NbInputModule, NbIconModule,
  NbToastrModule, NbPopoverModule, NbToggleModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    NbCardModule,
    ThemeModule,
    NbButtonModule,
    NbAccordionModule,
    NbIconModule,
    NbInputModule,
    NbToastrModule,
    NbToggleModule,
    NbPopoverModule,
    FormsModule,
  ],
  declarations: [
    CoreComponent,
  ]
})
export class BindersModule { }
