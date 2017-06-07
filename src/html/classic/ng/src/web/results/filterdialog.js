/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import React from 'react';

import  _ from '../../locale.js';
import {parse_int} from '../../utils.js';

import Layout from '../layout.js';
import {
  LabelFalsePositive,
  LabelHigh,
  LabelLog,
  LabelLow,
  LabelMedium,
} from '../severityclasslabels.js';

import Checkbox from '../form/checkbox.js';
import FormGroup from '../form/formgroup.js';
import Radio from '../form/radio.js';

import ApplyOverridesGroup from '../powerfilter/applyoverridesgroup.js';
import FilterStringGroup from '../powerfilter/filterstringgroup.js';
import FirstResultGroup from '../powerfilter/firstresultgroup.js';
import MinQodGroup from '../powerfilter/minqodgroup.js';
import ResultsPerPageGroup from '../powerfilter/resultsperpagegroup.js';
import SortByGroup from '../powerfilter/sortbygroup.js';
import {
  DefaultFilterDialogPropTypes,
  withFilterDialog,
} from '../powerfilter/dialog.js';

const SORT_FIELDS = [
  ['vulnerability', _('Vulnerability')],
  ['solution_type', _('Solution type')],
  ['severity', _('Severity')],
  ['qod', _('QoD')],
  ['host', _('Host')],
  ['location', _('Location')],
  ['created', _('Created')],
];

class ResultsFilterDialogComponent extends React.Component {

  constructor(props) {
    super(props);

    this.handleIntValueChange = this.handleIntValueChange.bind(this);
    this.handleLevelChange = this.handleLevelChange.bind(this);
  }

  handleIntValueChange(value, name) {
    let {onFilterValueChange} = this.props;

    value = parse_int(value);

    onFilterValueChange(value, name);
  }

  handleLevelChange(value, level) {
    let {filter, onFilterValueChange} = this.props;
    let levels = filter.get('levels');

    if (!levels) {
      levels = '';
    }

    if (value && !levels.includes(level)) {
      levels += level;
      onFilterValueChange(levels, 'levels');
    }
    else if (!value && level.includes(level)) {
      levels = levels.replace(level, '');
      onFilterValueChange(levels, 'levels');
    }
  }

  render() {
    let {filter, filterstring, onFilterStringChange, onFilterValueChange,
      onSortOrderChange, onSortByChange} = this.props;

    if (!filter) {
      return null;
    }

    let autofp = filter.get('autofp');
    let levels = filter.get('levels');

    if (!levels) {
      levels = '';
    }

    return (
      <Layout flex="column">

        <FilterStringGroup name="filterstring"
          filter={filterstring}
          onChange={onFilterStringChange}/>

        <ApplyOverridesGroup filter={filter} onChange={onFilterValueChange}/>

        <FormGroup title={_('Auto-FP')} flex="column">
          <Checkbox
            name="autofp"
            checkedValue="1"
            unCheckedValue="0"
            checked={autofp >= 1}
            title={_('Trust vendor security updates')}
            onChange={this.handleIntValueChange}/>
          <Layout flex box>
            <Radio
              name="autofp"
              value="1"
              disabled={autofp === 0}
              checked={autofp === 1}
              title={_('Full CVE match')}
              onChange={this.handleIntValueChange}/>
            <Radio
              name="autofp"
              value="2"
              disabled={autofp === 0}
              checked={autofp === 2}
              title={_('Partial CVE match')}
              onChange={this.handleIntValueChange}/>
          </Layout>
        </FormGroup>

        <MinQodGroup name="min_qod"
          filter={filter}
          onChange={onFilterValueChange}/>

        <FormGroup title={_('Severity (Class)')}>
          <Checkbox
            checked={levels.includes('h')}
            name="h"
            onChange={this.handleLevelChange}>
            <LabelHigh/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('m')}
            name="m"
            onChange={this.handleLevelChange}>
            <LabelMedium/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('l')}
            name="l"
            onChange={this.handleLevelChange}>
            <LabelLow/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('g')}
            name="g"
            onChange={this.handleLevelChange}>
            <LabelLog/>
          </Checkbox>
          <Checkbox
            checked={levels.includes('f')}
            name="f"
            onChange={this.handleLevelChange}>
            <LabelFalsePositive/>
          </Checkbox>
        </FormGroup>

        <FirstResultGroup
          filter={filter}
          onChange={onFilterValueChange}/>

        <ResultsPerPageGroup
          filter={filter}
          onChange={onFilterValueChange}/>

        <SortByGroup
          filter={filter}
          fields={SORT_FIELDS}
          onSortOrderChange={onSortOrderChange}
          onSortByChange={onSortByChange}/>
      </Layout>
    );
  }
}

ResultsFilterDialogComponent.propTypes = DefaultFilterDialogPropTypes;

export default withFilterDialog(ResultsFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80: