/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {isDefined} from '../utils/identity';
import {forEach, map} from '../utils/array';
import {isEmpty} from '../utils/string';

import {parseInt} from '../parser';

import Model from '../model';

import _ from '../locale';

export const EMPTY_SCAN_CONFIG_ID = '085569ce-73ed-11df-83c3-002264764cea';
export const FULL_AND_FAST_SCAN_CONFIG_ID =
  'daba56c8-73ec-11df-a475-002264764cea';

export const OSP_SCAN_CONFIG_TYPE = 1;
export const OPENVAS_SCAN_CONFIG_TYPE = 0;

export const SCANCONFIG_TREND_DYNAMIC = 1;
export const SCANCONFIG_TREND_STATIC = 0;

export const getTranslatedType = config => {
  return config.scan_config_type === OSP_SCAN_CONFIG_TYPE
    ? _('OSP')
    : _('OpenVAS');
};

export const parseCount = count => {
  return !isEmpty(count) && count !== '-1' ? parseInt(count) : undefined;
};

export const filterEmptyScanConfig = config =>
  config.id !== EMPTY_SCAN_CONFIG_ID;

export const openVasScanConfigsFilter = config =>
  config.scan_config_type === OPENVAS_SCAN_CONFIG_TYPE;
export const ospScanConfigsFilter = config =>
  config.scan_config_type === OSP_SCAN_CONFIG_TYPE;

export const parseTrend = parseInt;

class ScanConfig extends Model {
  static entityType = 'scanconfig';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    // for displaying the selected nvts (1 of 33) an object for accessing the
    // family by name is required
    const families = {};

    if (isDefined(elem.families)) {
      ret.family_list = map(elem.families.family, family => {
        const {name} = family;
        const new_family = {
          name,
          trend: parseTrend(family.growing),
          nvts: {
            count: parseCount(family.nvt_count),
            max: parseCount(family.max_nvt_count),
          },
        };
        families[name] = new_family;
        return new_family;
      });
    } else {
      ret.family_list = [];
    }

    if (isDefined(ret.family_count)) {
      families.count = parseCount(ret.family_count.__text);
      families.trend = parseTrend(ret.family_count.growing);

      delete ret.family_count;
    } else {
      families.count = 0;
    }

    ret.families = families;

    if (isDefined(ret.nvt_count)) {
      ret.nvts = {
        // number of selected nvts
        count: parseCount(ret.nvt_count.__text),
        trend: parseTrend(ret.nvt_count.growing),
      };

      delete ret.nvt_count;

      if (isDefined(ret.known_nvt_count)) {
        // number of known nvts by the scanner from last sync. should always be
        // equal or less then nvt_count because only the db may contain nvts not
        // known nvts by the scanner e.g. an imported scan config contains
        // private nvts
        ret.nvts.known = parseCount(ret.known_nvt_count);
        delete ret.known_nvt_count;
      }

      if (isDefined(ret.max_nvt_count)) {
        // sum of all available nvts of all selected families
        ret.nvts.max = parseCount(ret.max_nvt_count);
        delete ret.max_nvt_count;
      }
    } else {
      ret.nvts = {};
    }

    const nvt_preferences = [];
    const scanner_preferences = [];

    if (isDefined(elem.preferences)) {
      forEach(elem.preferences.preference, preference => {
        const pref = {...preference};
        if (isEmpty(pref.nvt.name)) {
          delete pref.nvt;

          scanner_preferences.push(pref);
        } else {
          const nvt = {...pref.nvt};
          pref.nvt = nvt;
          pref.nvt.oid = preference.nvt._oid;
          delete pref.nvt._oid;

          nvt_preferences.push(pref);
        }
      });
    }

    ret.preferences = {
      scanner: scanner_preferences,
      nvt: nvt_preferences,
    };

    ret.scan_config_type = parseInt(elem.type);

    if (isDefined(elem.scanner)) {
      const scanner = {
        ...elem.scanner,
        name: elem.scanner.__text,
      };
      ret.scanner = new Model(scanner, 'scanner');
    }

    if (isDefined(elem.tasks)) {
      ret.tasks = map(elem.tasks.task, task => new Model(task, 'task'));
    } else {
      ret.tasks = [];
    }

    return ret;
  }
}

export default ScanConfig;

// vim: set ts=2 sw=2 tw=80:
