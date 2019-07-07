/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState, useReducer } from 'react';
import { EuiText, EuiIcon, EuiButton, EuiSpacer, EuiLink, EuiPanel, EuiTitle } from '@elastic/eui';
import { IntegrationProps } from '../../../common/types';
import { installIntegration, asyncFetchReducer } from '../../data';
import { AssetTitleMap } from '.';

export function NotInstalledIntegration(props: IntegrationProps & { reload: () => void }) {
  const { description, name, version, availableAssets, reload } = props;
  const [installState, dispatch] = useReducer(asyncFetchReducer, {
    loading: false,
    success: false,
    failure: false,
  });

  async function install() {
    if (installState.loading) {
      return;
    }
    dispatch({ loading: true });
    try {
      await installIntegration(`${name}-${version}`);
    } catch (error) {
      dispatch({ loading: false, failure: true, error });
      return;
    }
    dispatch({ loading: false, success: true, error: null });
    reload();
  }

  function AddButton() {
    const successMessage = (
      <EuiText>
        <p>
          <EuiIcon type="check" /> Successfully removed!
        </p>
      </EuiText>
    );

    if (installState.failure) {
      // eslint-disable-next-line no-console
      console.log('An error occurred during install', installState.error);
      return (
        <EuiText>
          <p>There was a problem installing this integration.</p>
        </EuiText>
      );
    }
    return (
      <React.Fragment>
        {installState.success ? successMessage : null}
        <EuiButton disabled={installState.loading} onClick={install}>
          Add this integration
        </EuiButton>
      </React.Fragment>
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
        {availableAssets.map(asset => (
          <li key={asset}>{AssetTitleMap[asset]}</li>
        ))}
      </ul>
      <EuiSpacer />
      {installState.loading ? <p>Installing assets...</p> : null}
      <EuiSpacer />
      <AddButton />
    </EuiPanel>
  );
}
