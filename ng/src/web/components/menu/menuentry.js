/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {is_defined, is_array} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose.js';
import withCapabilties from '../../utils/withCapabilities.js';

import withClickHandler from '../form/withClickHandler.js';

import Layout from '../layout/layout.js';

import Link from '../link/link.js';

const StyledLink = glamorous(Link)({
  height: '100%',
});

const MenuEntry = ({
  capabilities,
  caps,
  children,
  title = children,
  to,
  ...props
}) => {
  if (is_defined(caps)) {

    if (!is_array(caps)) {
      caps = [caps];
    }

    const may_op = caps.reduce((a, b) => {
      return capabilities.mayOp(b) && a;
    }, true);

    if (!may_op) {
      return null;
    }
  }

  return (
    <Layout
      {...props}
      grow="1"
      align={['start', 'center']}
    >
      {is_defined(to) ?
        <StyledLink to={to}>{title}</StyledLink> :
        title
      }
    </Layout>
  );
};

MenuEntry.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  caps: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  title: PropTypes.string,
  to: PropTypes.string,
};

export default compose(
  withCapabilties,
  withClickHandler(),
)(MenuEntry);

// vim: set ts=2 sw=2 tw=80: