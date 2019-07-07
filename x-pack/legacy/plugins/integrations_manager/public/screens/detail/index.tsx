/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState, useEffect } from 'react';
import { getIntegrationInfoByKey } from '../../data';
import { IntegrationProps } from '../../../common/types';
import { InstalledIntegration } from './installed';
import { NotInstalledIntegration } from './not_installed';

export const AssetTitleMap = {
  'ingest-pipeline': 'Ingest Pipeline',
  dashboard: 'Dashboard',
  visualization: 'Visualization',
  'index-pattern': 'Index Pattern',
};

export function Detail(props: { package: string }) {
  const [info, setInfo] = useState<IntegrationProps | null>(null);
  useEffect(loadIntegration, [props.package]);

  function loadIntegration() {
    getIntegrationInfoByKey(props.package).then(setInfo);
  }

  // don't have designs for loading/empty states
  if (!info) return 'Loading integration detail page...';

  return info.status === 'installed' ? (
    <InstalledIntegration {...info} reload={loadIntegration} />
  ) : (
    <NotInstalledIntegration {...info} reload={loadIntegration} />
  );
}
