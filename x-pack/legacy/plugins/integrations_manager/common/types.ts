/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SavedObject } from '../../../../../target/types/server';
import { SavedObjectAttributes } from '../../../../../src/core/server';

export { Request, ServerRoute } from 'hapi';

// the contract with the registry
export type IntegrationList = IntegrationListItem[];
export type IntegrationStatus = 'installed' | 'not_installed';
export type IntegrationAssetType =
  | 'ingest-pipeline'
  | 'visualization'
  | 'dashboard'
  | 'index-pattern';

export interface IntegrationAsset {
  href: string;
  id: string;
  type: IntegrationAssetType;
  description?: string;
  title?: string;
}

export interface IntegrationStateSavedObject extends SavedObjectAttributes {
  installed: IntegrationAsset[];
}

// registry /list
// https://github.com/elastic/integrations-registry/blob/master/docs/api/list.json
export interface IntegrationListItem {
  description: string;
  download: string;
  icon: string;
  name: string;
  version: string;
  status: IntegrationStatus;
  savedObject?: SavedObject;
}

// registry /package/{name}
// https://github.com/elastic/integrations-registry/blob/master/docs/api/package.json
export interface IntegrationProps {
  name: string;
  version: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  availableAssets: IntegrationAssetType[];
  installedAssets: IntegrationAsset[];
  requirement: {
    kibana: {
      min: string;
      max: string;
    };
  };
}

// lifted from APM
export type PromiseReturnType<Func> = Func extends (...args: any[]) => Promise<infer Value>
  ? Value
  : Func;
