/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { PLUGIN_ID } from './constants';

export const API_ROOT = `/api/${PLUGIN_ID}`;
export const API_LIST_PATTERN = `${API_ROOT}/list`;
export const API_INFO_PATTERN = `${API_ROOT}/package/{pkgkey}`;
export const API_INSTALL_PATTERN = `${API_ROOT}/install/{pkgkey}/{feature?}`;
export const API_DELETE_PATTERN = `${API_ROOT}/delete/{pkgkey}/{feature?}`;

export function getListPath() {
  return API_LIST_PATTERN;
}

export function getInfoPath(pkgkey: string) {
  return API_INFO_PATTERN.replace('{pkgkey}', pkgkey);
}

export function getInstallPath(pkgkey: string, feature: string = '') {
  return API_INSTALL_PATTERN.replace('{pkgkey}', pkgkey)
    .replace('{feature?}', feature)
    .replace(/\/$/, ''); // trim trailing slash
}

export function getRemovePath(pkgkey: string, feature: string = '') {
  return API_DELETE_PATTERN.replace('{pkgkey}', pkgkey)
    .replace('{feature?}', feature)
    .replace(/\/$/, ''); // trim trailing slash
}
