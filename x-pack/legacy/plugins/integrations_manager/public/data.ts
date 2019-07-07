/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { npStart } from 'ui/new_platform';
import { HttpHandler } from 'src/core/public/http';
import { Reducer } from 'react';
import { IntegrationProps, IntegrationList } from '../common/types';
import { getListPath, getInfoPath, getInstallPath, getRemovePath } from '../common/routes';

let _fetch: HttpHandler = npStart.core.http.fetch;

export interface AsyncFetchState {
  loading: boolean;
  success: boolean;
  failure: boolean;
  error?: Error | null;
}

export const asyncFetchReducer: Reducer<AsyncFetchState, Partial<AsyncFetchState>> = (
  state,
  newState
) => ({
  ...state,
  ...newState,
});

export function setClient(client: HttpHandler): void {
  _fetch = client;
}

export async function getIntegrationsList(): Promise<IntegrationList> {
  const path = getListPath();
  const list: IntegrationList = await _fetch(path);

  return list;
}

export async function getIntegrationsGroupedByState() {
  const path = getListPath();
  const list: IntegrationList = await _fetch(path);

  return list.reduce(
    (grouped: { not_installed: IntegrationList; installed: IntegrationList }, item) => {
      if (!grouped[item.status]) {
        grouped[item.status] = [];
      }
      grouped[item.status].push(item);
      return grouped;
    },
    { installed: [], not_installed: [] }
  );
}

export async function getIntegrationInfoByKey(pkgkey: string): Promise<IntegrationProps> {
  const path = getInfoPath(pkgkey);
  const info: IntegrationProps = await _fetch(path);

  return info;
}

export async function installIntegration(pkgkey: string) {
  const path = getInstallPath(pkgkey);
  return await _fetch(path);
}

export async function removeIntegration(pkgkey: string) {
  const path = getRemovePath(pkgkey);
  return await _fetch(path);
}
