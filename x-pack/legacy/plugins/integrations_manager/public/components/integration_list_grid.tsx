/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';
import { EuiFlexGrid, EuiFlexItem, EuiTitle, EuiSpacer, EuiText } from '@elastic/eui';
import { IntegrationListItem, PromiseReturnType, IntegrationList } from '../../common/types';
import { IntegrationCard } from './integration_card';
import { getIntegrationsGroupedByState } from '../data';

interface ListProps {
  list: PromiseReturnType<typeof getIntegrationsGroupedByState>;
}

export function IntegrationListGrid({ list }: ListProps) {
  return (
    <div>
      <EuiTitle>
        <h3>Your integrations</h3>
      </EuiTitle>

      <GridGroup list={list.installed} />

      <EuiSpacer size="xl" />

      <EuiTitle>
        <h3>Available integrations</h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      <GridGroup list={list.not_installed} />
    </div>
  );
}

function GridItem(item: IntegrationListItem) {
  return (
    <EuiFlexItem>
      <IntegrationCard {...item} />
    </EuiFlexItem>
  );
}

function GridGroup({ list = [] }: { list?: IntegrationList }) {
  if (!list || list.length === 0) {
    return (
      <EuiText>
        <p>No integrations found.</p>
      </EuiText>
    );
  }
  return (
    <EuiFlexGrid gutterSize="l" columns={3}>
      {list.map(item => (
        <GridItem key={`${item.name}-${item.version}`} {...item} />
      ))}
    </EuiFlexGrid>
  );
}
