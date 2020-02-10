/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// Follow pattern from https://github.com/elastic/kibana/pull/52447
// TODO: Update when https://github.com/elastic/kibana/issues/53021 is closed
import {
  SavedObject,
  SavedObjectAttributes,
  SavedObjectReference,
} from '../../../../../src/core/public';
import { AssetType as IngestAssetType } from '../../../../legacy/plugins/ingest/common/types/domain_data';

export enum InstallationStatus {
  installed = 'installed',
  notInstalled = 'not_installed',
}

export type ServiceName = 'kibana' | 'elasticsearch';
export type AssetType = KibanaAssetType | ElasticsearchAssetType | AgentAssetType;

export enum KibanaAssetType {
  dashboard = 'dashboard',
  visualization = 'visualization',
  search = 'search',
  indexPattern = 'index-pattern',
}

export enum ElasticsearchAssetType {
  ingestPipeline = 'ingest-pipeline',
  indexTemplate = 'index-template',
  ilmPolicy = 'ilm-policy',
}

export enum AgentAssetType {
  input = 'input',
}

// from /package/{name}
// type Package struct at https://github.com/elastic/package-registry/blob/master/util/package.go
// https://github.com/elastic/package-registry/blob/master/docs/api/package.json
export interface RegistryPackage {
  name: string;
  title?: string;
  version: string;
  readme?: string;
  description: string;
  type: string;
  categories: string[];
  requirement: RequirementsByServiceName;
  screenshots?: ScreenshotItem[];
  icons?: string[];
  assets?: string[];
  internal?: boolean;
  format_version: string;
  datasets?: Dataset[];
  download: string;
  path: string;
}

export type RequirementVersion = string;
export type RequirementVersionRange = string;
export interface ServiceRequirements {
  versions: RequirementVersionRange;
}

// Registry's response types
// from /search
// https://github.com/elastic/package-registry/blob/master/docs/api/search.json
export type RegistrySearchResults = RegistrySearchResult[];
// from getPackageOutput at https://github.com/elastic/package-registry/blob/master/search.go
export type RegistrySearchResult = Pick<
  RegistryPackage,
  'name' | 'title' | 'version' | 'description' | 'type' | 'icons' | 'internal' | 'download' | 'path'
>;

export interface ScreenshotItem {
  src: string;
  title?: string;
}

// from /categories
// https://github.com/elastic/package-registry/blob/master/docs/api/categories.json
export type CategorySummaryList = CategorySummaryItem[];
export type CategoryId = string;
export interface CategorySummaryItem {
  id: CategoryId;
  title: string;
  count: number;
}

export type RequirementsByServiceName = Record<ServiceName, ServiceRequirements>;
export interface AssetParts {
  pkgkey: string;
  dataset?: string;
  service: ServiceName;
  type: AssetType;
  file: string;
}
export type AssetTypeToParts = KibanaAssetTypeToParts & ElasticsearchAssetTypeToParts;
export type AssetsGroupedByServiceByType = Record<
  Extract<ServiceName, 'kibana'>,
  KibanaAssetTypeToParts
>;
// & Record<Extract<ServiceName, 'elasticsearch'>, ElasticsearchAssetTypeToParts>;

export type KibanaAssetParts = AssetParts & {
  service: Extract<ServiceName, 'kibana'>;
  type: KibanaAssetType;
};

export type ElasticsearchAssetParts = AssetParts & {
  service: Extract<ServiceName, 'elasticsearch'>;
  type: ElasticsearchAssetType;
};

export type KibanaAssetTypeToParts = Record<KibanaAssetType, KibanaAssetParts[]>;
export type ElasticsearchAssetTypeToParts = Record<
  ElasticsearchAssetType,
  ElasticsearchAssetParts[]
>;

export interface Dataset {
  title: string;
  name: string;
  release: string;
  ingest_pipeline: string;
  vars?: VarsEntry[];
  type: string;
  package: string;
}

export interface VarsEntry {
  name: string;
  default: string;
}

// some properties are optional in Registry responses but required in EPM
// internal until we need them
interface PackageAdditions {
  title: string;
  assets: AssetsGroupedByServiceByType;
}

// Managers public HTTP response types
export type PackageList = PackageListItem[];

export type PackageListItem = Installable<RegistrySearchResult & PackageAdditions>;
export type PackagesGroupedByStatus = Record<InstallationStatus, PackageList>;
export type PackageInfo = Installable<RegistryPackage & PackageAdditions>;

export interface Installation extends SavedObjectAttributes {
  installed: AssetReference[];
}

export type Installable<T> = Installed<T> | NotInstalled<T>;

export type Installed<T = {}> = T & {
  status: InstallationStatus.installed;
  savedObject: SavedObject<Installation>;
};

export type NotInstalled<T = {}> = T & {
  status: InstallationStatus.notInstalled;
};

export type AssetReference = Pick<SavedObjectReference, 'id'> & {
  type: AssetType | IngestAssetType;
};

// Calling Object.entries(PackagesGroupedByStatus) gave `status: string`
// which causes a "string is not assignable to type InstallationStatus` error
// see https://github.com/Microsoft/TypeScript/issues/20322
// and https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208
// and https://github.com/Microsoft/TypeScript/issues/21826#issuecomment-479851685
export const entries = Object.entries as <T>(o: T) => Array<[keyof T, T[keyof T]]>;
