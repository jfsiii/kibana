/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import React, { useState } from 'react';
import { AgentConfig } from '../../../../../types';
import { EnrollmentInstructions } from './instructions';
import { APIKeySelection } from './key_selection';

interface Props {
  onClose: () => void;
  agentConfigs: AgentConfig[];
}

export const AgentEnrollmentFlyout: React.FunctionComponent<Props> = ({
  onClose,
  agentConfigs = [],
}) => {
  const [selectedAPIKeyId, setSelectedAPIKeyId] = useState<string | null>(null);

  return (
    <EuiFlyout onClose={onClose} size="l" maxWidth={640}>
      <EuiFlyoutHeader hasBorder aria-labelledby="FleetAgentEnrollmentFlyoutTitle">
        <EuiTitle size="m">
          <h2 id="FleetAgentEnrollmentFlyoutTitle">
            <FormattedMessage
              id="xpack.ingestManager.agentEnrollment.flyoutTitle"
              defaultMessage="Enroll new agent"
            />
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <APIKeySelection
          agentConfigs={agentConfigs}
          onKeyChange={keyId => setSelectedAPIKeyId(keyId)}
        />
        <EuiSpacer size="l" />
        <EnrollmentInstructions selectedAPIKeyId={selectedAPIKeyId} />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="cross" onClick={onClose} flush="left">
              <FormattedMessage
                id="xpack.ingestManager.agentEnrollment.cancelButtonLabel"
                defaultMessage="Cancel"
              />
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={onClose}>
              <FormattedMessage
                id="xpack.ingestManager.agentEnrollment.continueButtonLabel"
                defaultMessage="Continue"
              />
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
