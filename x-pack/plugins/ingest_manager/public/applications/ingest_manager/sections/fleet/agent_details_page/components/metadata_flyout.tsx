/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiDescriptionList,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import React from 'react';
import { Agent } from '../../../../types';
import { MetadataForm } from './metadata_form';

interface Props {
  agent: Agent;
  flyout: { hide: () => void };
}
export const AgentMetadataFlyout: React.FunctionComponent<Props> = ({ agent, flyout }) => {
  const mapMetadata = (obj: { [key: string]: string } | undefined) => {
    return Object.keys(obj || {}).map(key => ({
      title: key,
      description: obj ? obj[key] : '',
    }));
  };

  const localItems = mapMetadata(agent.local_metadata);
  const userProvidedItems = mapMetadata(agent.user_provided_metadata);

  return (
    <EuiFlyout onClose={() => flyout.hide()} size="s" aria-labelledby="flyoutTitle">
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">
            <FormattedMessage
              id="xpack.ingestManager.agentDetails.metadataSectionTitle"
              defaultMessage="Metadata"
            />
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiTitle size="s">
          <h3>
            <FormattedMessage
              id="xpack.ingestManager.agentDetails.localMetadataSectionSubtitle"
              defaultMessage="Local metadata"
            />
          </h3>
        </EuiTitle>
        <EuiHorizontalRule />
        <EuiDescriptionList type="column" compressed listItems={localItems} />
        <EuiSpacer size="xxl" />
        <EuiTitle size="s">
          <h3>
            <FormattedMessage
              id="xpack.ingestManager.agentDetails.userProvidedMetadataSectionSubtitle"
              defaultMessage="User provided metadata"
            />
          </h3>
        </EuiTitle>
        <EuiHorizontalRule />
        <EuiDescriptionList type="column" compressed listItems={userProvidedItems} />
        <EuiSpacer size="m" />

        <MetadataForm agent={agent} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
