/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState, useEffect } from 'react';
import { EuiPanel, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { getIntegrationsGroupedByState } from '../data';
import { IntegrationListGrid } from '../components/integration_list_grid';
import { PromiseReturnType } from '../../common/types';

export function Home() {
  const [list, setList] = useState<PromiseReturnType<typeof getIntegrationsGroupedByState>>({});

  useEffect(() => {
    getIntegrationsGroupedByState().then(setList);
  }, []);

  return (
    <EuiPanel>
      <EuiTitle>
        <h1>Elastic Integrations Manager</h1>
      </EuiTitle>
      <EuiSpacer />
      {list ? <IntegrationListGrid list={list} /> : null}
    </EuiPanel>
  );
}
