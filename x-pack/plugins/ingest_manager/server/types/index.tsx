/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { ScopedClusterClient } from 'src/core/server/';

export {
  Agent,
  AgentAction,
  AgentConfig,
  AgentConfigStatus,
  AgentEvent,
  AgentEventSOAttributes,
  AgentSOAttributes,
  AgentStatus,
  AgentType,
  AssetParts,
  AssetReference,
  AssetsGroupedByServiceByType,
  AssetType,
  CategoryId,
  CategorySummaryList,
  Dataset,
  Datasource,
  DefaultPackages,
  ElasticsearchAssetType,
  EnrollmentAPIKey,
  EnrollmentAPIKeySOAttributes,
  FullAgentConfig,
  FullAgentConfigDatasource,
  IndexTemplate,
  IngestAssetType,
  Installable,
  Installation,
  InstallationStatus,
  KibanaAssetType,
  NewAgentConfig,
  NewDatasource,
  NewOutput,
  Output,
  OutputType,
  PackageInfo,
  RegistryPackage,
  RegistrySearchResult,
  RegistrySearchResults,
  RegistryVarsEntry,
} from '../../common';
export * from './models';
export * from './rest_spec';

export type CallESAsCurrentUser = ScopedClusterClient['callAsCurrentUser'];

export type AgentConfigUpdateHandler = (
  action: 'created' | 'updated' | 'deleted',
  agentConfigId: string
) => Promise<void>;
