/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { IRouter } from 'kibana/server';
import { EPM_API_ROUTES, PLUGIN_ID } from '../../constants';
import {
  DeletePackageRequestSchema,
  GetFileRequestSchema,
  GetInfoRequestSchema,
  GetPackagesRequestSchema,
  InstallPackageRequestSchema,
} from '../../types';
import {
  deletePackageHandler,
  getCategoriesHandler,
  getFileHandler,
  getInfoHandler,
  getListHandler,
  installPackageHandler,
} from './handlers';

export const registerRoutes = (router: IRouter) => {
  router.get(
    {
      path: EPM_API_ROUTES.CATEGORIES_PATTERN,
      validate: false,
      options: { tags: [`access:${PLUGIN_ID}-read`] },
    },
    getCategoriesHandler
  );

  router.get(
    {
      path: EPM_API_ROUTES.LIST_PATTERN,
      validate: GetPackagesRequestSchema,
      options: { tags: [`access:${PLUGIN_ID}-read`] },
    },
    getListHandler
  );

  router.get(
    {
      path: EPM_API_ROUTES.FILEPATH_PATTERN,
      validate: GetFileRequestSchema,
      options: { tags: [`access:${PLUGIN_ID}-read`] },
    },
    getFileHandler
  );

  router.get(
    {
      path: EPM_API_ROUTES.INFO_PATTERN,
      validate: GetInfoRequestSchema,
      options: { tags: [`access:${PLUGIN_ID}-read`] },
    },
    getInfoHandler
  );

  router.post(
    {
      path: EPM_API_ROUTES.INSTALL_PATTERN,
      validate: InstallPackageRequestSchema,
      options: { tags: [`access:${PLUGIN_ID}-all`] },
    },
    installPackageHandler
  );

  router.delete(
    {
      path: EPM_API_ROUTES.DELETE_PATTERN,
      validate: DeletePackageRequestSchema,
      options: { tags: [`access:${PLUGIN_ID}-all`] },
    },
    deletePackageHandler
  );
};
