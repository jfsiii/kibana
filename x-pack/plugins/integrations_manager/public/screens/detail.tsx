/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState, useEffect } from 'react';
import { EuiPanel, EuiTitle } from '@elastic/eui';
import { getIntegrationInfoByKey } from '../data';
import { IntegrationInfo } from '../../common/types';

interface MatchPackage {
  match: {
    params: {
      pkgkey: string;
    };
  };
}

export function Detail({ match }: MatchPackage) {
  const { pkgkey } = match.params;
  const [info, setInfo] = useState(({} = {} as IntegrationInfo));

  useEffect(() => {
    getIntegrationInfoByKey(pkgkey).then(({ data }) => setInfo(data));
  }, []);
  const { description, name, version, icon } = info;

  return (
    <EuiPanel>
      <EuiTitle>
        <h2>{`${name} (v${version})`}</h2>
      </EuiTitle>
      <p>{description}</p>
    </EuiPanel>
  );
}
