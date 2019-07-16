/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
} from 'gmp/models/audit';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import Checkbox from 'web/components/form/checkbox';
import YesNoRadio from 'web/components/form/yesnoradio';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import AddResultsToAssetsGroup from 'web/pages/tasks/addresultstoassetsgroup';
import AutoDeleteReportsGroup from 'web/pages/tasks/autodeletereportsgroup';

const DEFAULT_MAX_CHECKS = 4;
const DEFAULT_MAX_HOSTS = 20;

const AuditDialog = ({
  alert_ids = [],
  alerts = [],
  alterable = NO_VALUE,
  auto_delete = AUTO_DELETE_NO,
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  capabilities,
  comment = '',
  policy_id,
  hosts_ordering = HOSTS_ORDERING_SEQUENTIAL,
  in_assets = YES_VALUE,
  max_checks = DEFAULT_MAX_CHECKS,
  max_hosts = DEFAULT_MAX_HOSTS,
  name = _('Unnamed'),
  policies = [],
  schedule_id = UNSET_VALUE,
  schedule_periods = NO_VALUE,
  schedules = [],
  source_iface = '',
  target_id,
  targets,
  audit,
  title = _('New Audit'),
  onAlertsChange,
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewTargetClick,
  onSave,
  onPolicyChange,
  onScheduleChange,
  onTargetChange,
  ...data
}) => {
  const target_items = renderSelectItems(targets);

  const schedule_items = renderSelectItems(schedules, UNSET_VALUE);

  const policyItems = renderSelectItems(policies);

  const alert_items = renderSelectItems(alerts);

  // having an audit means we are editing an audit
  const hasAudit = isDefined(audit);

  const changeAudit = hasAudit ? audit.isChangeable() : true;

  const uncontrolledData = {
    ...data,
    alterable,
    auto_delete,
    auto_delete_data,
    comment,
    hosts_ordering,
    in_assets,
    max_checks,
    max_hosts,
    name,
    source_iface,
    audit,
  };

  const controlledData = {
    alert_ids,
    policy_id,
    schedule_id,
    target_id,
  };

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => {
        const policyId = selectSaveId(policies, state.policy_id);

        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                size="30"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                grow="1"
                size="30"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Scan Targets')}>
              <Divider>
                <Select
                  name="target_id"
                  disabled={!changeAudit}
                  items={target_items}
                  value={state.target_id}
                  onChange={onTargetChange}
                />
                {changeAudit && (
                  <Layout>
                    <NewIcon
                      title={_('Create a new target')}
                      onClick={onNewTargetClick}
                    />
                  </Layout>
                )}
              </Divider>
            </FormGroup>

            {capabilities.mayOp('get_alerts') && (
              <FormGroup title={_('Alerts')}>
                <Divider>
                  <MultiSelect
                    name="alert_ids"
                    items={alert_items}
                    value={state.alert_ids}
                    onChange={onAlertsChange}
                  />
                  <Layout>
                    <NewIcon
                      title={_('Create a new alert')}
                      onClick={onNewAlertClick}
                    />
                  </Layout>
                </Divider>
              </FormGroup>
            )}

            {capabilities.mayOp('get_schedules') && (
              <FormGroup title={_('Schedule')}>
                <Divider>
                  <Select
                    name="schedule_id"
                    value={state.schedule_id}
                    items={schedule_items}
                    onChange={onScheduleChange}
                  />
                  <Checkbox
                    name="schedule_periods"
                    checked={state.schedule_periods === YES_VALUE}
                    checkedValue={YES_VALUE}
                    unCheckedValue={NO_VALUE}
                    title={_('Once')}
                    onChange={onValueChange}
                  />
                  <Layout>
                    <NewIcon
                      title={_('Create a new schedule')}
                      onClick={onNewScheduleClick}
                    />
                  </Layout>
                </Divider>
              </FormGroup>
            )}

            <AddResultsToAssetsGroup
              inAssets={state.in_assets}
              onChange={onValueChange}
            />

            {changeAudit && (
              <FormGroup title={_('Alterable Audit')}>
                <YesNoRadio
                  name="alterable"
                  disabled={audit && !audit.isNew()}
                  value={state.alterable}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <AutoDeleteReportsGroup
              autoDelete={state.auto_delete}
              autoDeleteData={state.auto_delete_data}
              onChange={onValueChange}
            />

            <Layout flex="column" grow="1">
              <FormGroup titleSize="2" title={_('Policy')}>
                <Select
                  name="policy_id"
                  disabled={!changeAudit || hasAudit}
                  items={policyItems}
                  value={policyId}
                  onChange={onPolicyChange}
                />
              </FormGroup>
              <FormGroup titleSize="4" title={_('Network Source Interface')}>
                <TextField
                  name="source_iface"
                  value={state.source_iface}
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup titleSize="4" title={_('Order for target hosts')}>
                <Select
                  name="hosts_ordering"
                  items={[
                    {
                      value: 'sequential',
                      label: _('Sequential'),
                    },
                    {
                      value: 'random',
                      label: _('Random'),
                    },
                    {
                      value: 'reverse',
                      label: _('Reverse'),
                    },
                  ]}
                  value={state.hosts_ordering}
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup
                titleSize="4"
                title={_('Maximum concurrently executed NVTs per host')}
              >
                <Spinner
                  name="max_checks"
                  size="10"
                  min="0"
                  maxLength="10"
                  value={state.max_checks}
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup
                titleSize="4"
                title={_('Maximum concurrently scanned hosts')}
              >
                <Spinner
                  name="max_hosts"
                  type="int"
                  min="0"
                  size="10"
                  maxLength="10"
                  value={state.max_hosts}
                  onChange={onValueChange}
                />
              </FormGroup>
            </Layout>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

AuditDialog.propTypes = {
  alert_ids: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.yesno,
  audit: PropTypes.model,
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  hosts_ordering: PropTypes.oneOf(['sequential', 'random', 'reverse']),
  in_assets: PropTypes.yesno,
  max_checks: PropTypes.number,
  max_hosts: PropTypes.number,
  name: PropTypes.string,
  policies: PropTypes.arrayOf(PropTypes.model),
  policy_id: PropTypes.idOrZero,
  schedule_id: PropTypes.idOrZero,
  schedule_periods: PropTypes.yesno,
  schedules: PropTypes.array,
  source_iface: PropTypes.string,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  title: PropTypes.string,
  onAlertsChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func.isRequired,
  onNewScheduleClick: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onPolicyChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScheduleChange: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
};

export default withCapabilities(AuditDialog);

// vim: set ts=2 sw=2 tw=80:
