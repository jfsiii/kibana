/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useReducer } from 'react';
import { EuiText, EuiIcon, EuiButton, EuiSpacer, EuiLink, EuiPanel, EuiTitle } from '@elastic/eui';
import { IntegrationProps } from '../../../common/types';
import { removeIntegration, asyncFetchReducer } from '../../data';

export function InstalledIntegration(props: IntegrationProps & { reload: () => void }) {
  const { description, name, version, installedAssets, reload } = props;
  const [removalState, dispatch] = useReducer(asyncFetchReducer, {
    loading: false,
    success: false,
    failure: false,
  });

  async function remove() {
    if (removalState.loading) {
      return;
    }
    dispatch({ loading: true });
    try {
      await removeIntegration(`${name}-${version}`);
    } catch (error) {
      dispatch({ loading: false, failure: true, error });
      return;
    }
    dispatch({ loading: false, success: true, error: null });
    reload();
  }

  function RemoveButton() {
    if (removalState.failure) {
      // eslint-disable-next-line no-console
      console.log('An error occurred during removal', removalState.error);
      return (
        <EuiText>
          <p>There was a problem removing this integration.</p>
        </EuiText>
      );
    }
    return (
      <div>
        <EuiButton disabled={removalState.loading} onClick={remove}>
          Remove this integration
        </EuiButton>
        <EuiSpacer size="s" />
        <EuiText size="xs">
          <p>This will remove all of the installed assets for this integration.</p>
        </EuiText>
      </div>
    );
  }

  return (
    <EuiPanel>
      <EuiLink href={window.location.href.replace(/#.*$/, '')}>
        <EuiIcon type="arrowLeft" /> Back to list
      </EuiLink>
      <EuiSpacer />
      <EuiTitle>
        <h1>{`${name} (v${version})`}</h1>
      </EuiTitle>
      <EuiSpacer />
      <p>{description}</p>
      <EuiSpacer />
      <EuiTitle size="s">
        <h5>Included in this install:</h5>
      </EuiTitle>
      <ul style={{ lineHeight: '1.5' }}>
        {installedAssets.map(asset => (
          <li key={asset.id}>
            <EuiLink target="_blank" href={asset.href}>
              <EuiIcon type="check" /> {asset.type}:{' '}
              {asset.description ? asset.description : asset.title ? asset.title : asset.id}
            </EuiLink>
          </li>
        ))}
      </ul>
      <EuiSpacer />
      {removalState.loading ? <p>Removing assets...</p> : null}
      <EuiSpacer />
      <RemoveButton />
    </EuiPanel>
  );
}
