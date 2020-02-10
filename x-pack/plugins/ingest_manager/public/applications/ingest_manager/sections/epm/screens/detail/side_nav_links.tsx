/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiButtonEmpty, EuiButtonEmptyProps } from '@elastic/eui';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import { DetailViewPanelName } from '../../types';
import { PackageInfo, entries } from '../../../../../../../common/types/epm';
// import { useLinks, useGetPackageInstallStatus } from '../../hooks';
// import { InstallStatus } from '../../types';

export type NavLinkProps = Pick<PackageInfo, 'name' | 'version'> & {
  active: DetailViewPanelName;
};

const PanelDisplayNames: Record<DetailViewPanelName, string> = {
  overview: 'Overview',
  'data-sources': 'Data Sources',
};

export function SideNavLinks({ name, version, active }: NavLinkProps) {
  // XXX restore once hooks are available
  // const { toDetailView } = useLinks();
  // const getPackageInstallStatus = useGetPackageInstallStatus();
  // const packageInstallStatus = getPackageInstallStatus(name);

  return (
    <Fragment>
      {entries(PanelDisplayNames).map(([panel, display]) => {
        const Link = styled(EuiButtonEmpty).attrs<EuiButtonEmptyProps>({
          href: 'brokenLink',
        })`
          font-weight: bold;
        `;
        // don't display Data Sources tab if the package is not installed
        // XXX restore once hooks are available, for now always display
        // if (packageInstallStatus !== InstallStatus.installed && panel === 'data-sources')
        //  return null;

        return (
          <div key={panel}>
            <Link>{display}</Link>
          </div>
        );
      })}
    </Fragment>
  );
}

// XXX restore once hooks are available
/* <Fragment>
      {entries(PanelDisplayNames).map(([panel, display]) => {
        const Link = styled(EuiButtonEmpty).attrs<EuiButtonEmptyProps>({
          href: toDetailView({ name, version, panel }),
        })`
          font-weight: ${p =>
            active === panel
              ? p.theme.eui.euiFontWeightSemiBold
              : p.theme.eui.euiFontWeightRegular};
        `;
        // don't display Data Sources tab if the package is not installed
        if (packageInstallStatus !== InstallStatus.installed && panel === 'data-sources')
          return null;

        return (
          <div key={panel}>
            <Link>{display}</Link>
          </div>
        );
      })}
    </Fragment> */
