/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { PLUGIN_ID, SAVED_OBJECT_TYPE } from '../common/constants';
import { Request, ServerRoute, IntegrationStateSavedObject } from '../common/types';
import {
  API_LIST_PATTERN,
  API_INFO_PATTERN,
  API_INSTALL_PATTERN,
  API_DELETE_PATTERN,
} from '../common/routes';
import { getClient, InstallationSavedObject } from './saved_objects';
import { fetchInfo, fetchList, getArchiveInfo, getObjects } from './registry';

interface PackageRequest extends Request {
  params: {
    pkgkey: string;
  };
}

interface InstallFeatureRequest extends PackageRequest {
  params: {
    pkgkey: string;
    feature: string;
  };
}

// Manager public API paths
export const routes: ServerRoute[] = [
  {
    method: 'GET',
    path: API_LIST_PATTERN,
    options: { tags: [`access:${PLUGIN_ID}`], json: { space: 2 } },
    handler: async (req: Request) => {
      const registryItems = await fetchList();
      const searchObjects = registryItems.map(({ name, version }) => ({
        type: SAVED_OBJECT_TYPE,
        id: `${name}-${version}`,
      }));
      const client = getClient(req);
      const results = await client.bulkGet(searchObjects);
      const savedObjects = results.saved_objects.filter(o => !o.error); // ignore errors for now

      for (const item of registryItems) {
        const installedObject = savedObjects.find(o => o.id === `${item.name}-${item.version}`);
        if (installedObject) {
          item.status = 'installed';
          item.savedObject = installedObject;
        } else {
          item.status = 'not_installed';
        }
      }

      return registryItems;
    },
  },
  {
    method: 'GET',
    path: API_INFO_PATTERN,
    options: { tags: [`access:${PLUGIN_ID}`], json: { space: 2 } },
    handler: async (req: PackageRequest) => {
      const { pkgkey } = req.params;
      const [info, paths] = await Promise.all([
        fetchInfo(pkgkey),
        getArchiveInfo(`${pkgkey}.tar.gz`),
      ]);

      const savedObject = await getClient(req)
        .get<IntegrationStateSavedObject>(SAVED_OBJECT_TYPE, pkgkey)
        .catch((err: Error) => {
          /* swallow errors for now */
          // eslint-disable-next-line no-console
          console.log('error getting saved object for IM state', err);
        });

      const status = savedObject && !savedObject.error ? 'installed' : 'not_installed';

      const installedAssets = savedObject
        ? savedObject.attributes.installed.map(o => {
            switch (o.type) {
              case 'dashboard':
                return { ...o, href: `/app/kibana#/dashboard/${o.id}` };
              case 'visualization':
                return { ...o, href: `/app/kibana#/visualize/edit/${o.id}` };
              case 'index-pattern':
                return { ...o, href: `/app/kibana#/management/kibana/index_patterns/${o.id}` };
              default:
                return o;
            }
          })
        : [];

      // map over paths and test types from https://github.com/elastic/integrations-registry/blob/master/ASSETS.md
      const availableAssets = ['ingest-pipeline', 'visualization', 'dashboard', 'index-pattern'];

      return {
        ...info,
        paths,
        availableAssets,
        status,
        savedObject,
        installedAssets,
      };
    },
  },
  {
    method: 'GET',
    path: API_INSTALL_PATTERN,
    options: { tags: [`access:${PLUGIN_ID}`], json: { space: 2 } },
    handler: async (req: InstallFeatureRequest) => {
      const { pkgkey, feature } = req.params;
      let toBeSavedObjects = await getObjects(pkgkey, feature);

      const pkgName = pkgkey.split('-')[0];

      // Temporarily fill in description and title to align
      // fake data with current package name
      toBeSavedObjects = toBeSavedObjects.map((o, i) => {
        const copy = { ...o, attributes: { ...o.attributes } };
        if (o.attributes && o.attributes.title) {
          copy.attributes.title = `${pkgName}---${o.attributes.title}`;
        }
        if (o.attributes && o.attributes.description) {
          copy.attributes.description = `[${pkgName}] ${o.attributes.description}`;
        }
        return copy;
      });

      if (feature === 'dashboard' || !feature) {
        const client = getClient(req);
        const createResults = await client.bulkCreate(toBeSavedObjects, { overwrite: true });
        const installed = createResults.saved_objects.map(({ id, type, attributes = {} }) => ({
          id,
          type,
          title: attributes.title,
          description: attributes.description,
        }));
        const mgrResults = await client.create(
          SAVED_OBJECT_TYPE,
          { installed },
          { id: pkgkey, overwrite: true }
        );

        return { ...mgrResults, createResults, toBeSavedObjects };
      }

      return {
        pkgkey,
        feature,
        created: [],
      };
    },
  },
  {
    method: 'GET',
    path: API_DELETE_PATTERN,
    options: { tags: [`access:${PLUGIN_ID}`], json: { space: 2 } },
    handler: async (req: InstallFeatureRequest) => {
      const { pkgkey, feature } = req.params;
      const client = getClient(req);

      const installation: InstallationSavedObject = await client.get(SAVED_OBJECT_TYPE, pkgkey);
      const installedObjects = installation.attributes.installed;

      // Delete the manager saved object with references to the asset objects
      // could also update with [] or some other state
      await client.delete(SAVED_OBJECT_TYPE, pkgkey);

      // ASK: should the manager uninstall the assets it installed
      // or just the references in SAVED_OBJECT_TYPE?
      if (feature === 'dashboard' || !feature) {
        // Delete the installed assets
        const deletePromises = installedObjects.map(async ({ id, type }) =>
          client.delete(type, id)
        );
        await Promise.all(deletePromises);
      }

      return {
        pkgkey,
        feature,
        deleted: installedObjects || [],
      };
    },
  },
];
