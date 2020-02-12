/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { generatePath } from 'react-router-dom';
// import { useCore } from '.';
// import { PLUGIN } from '../../common/constants';
import { epmRouteService } from '../../../../../../common/services';

// import { DetailViewPanelName } from '..';

const { getFilePath, getInfoPath } = epmRouteService;
// create './types' later and move there?
type DetailViewPanelName = 'overview' | 'data-sources';

// TODO: get this from server/packages/handlers.ts (move elsewhere?)
// seems like part of the name@version change
interface DetailParams {
  name: string;
  version: string;
  panel?: DetailViewPanelName;
  withAppRoot?: boolean;
}

const removeRelativePath = (relativePath: string): string =>
  new URL(relativePath, 'http://example.com').pathname;

export function useLinks() {
  // XXX no http on fake core contest
  // const { http } = useCore();
  function appRoot(path: string) {
    // include '#' because we're using HashRouter
    // return http.basePath.prepend(patterns.APP_ROOT + '#' + path);
    return 'really/wrong/app/root';
  }

  // return {
  //   toAssets: (path: string) => http.basePath.prepend(`/plugins/${PLUGIN.ID}/assets/${path}`),
  //   toImage: (path: string) => http.basePath.prepend(getFilePath(path)),
  //   toRelativeImage: ({
  //     path,
  //     packageName,
  //     version,
  //   }: {
  //     path: string;
  //     packageName: string;
  //     version: string;
  //   }) => {
  //     const imagePath = removeRelativePath(path);
  //     const pkgkey = `${packageName}-${version}`;
  //     const filePath = `${getInfoPath(pkgkey)}/${imagePath}`;
  //     return http.basePath.prepend(filePath);
  //   },
  //   toListView: () => appRoot(patterns.LIST_VIEW),
  //   toDetailView: ({ name, version, panel, withAppRoot = true }: DetailParams) => {
  //     // panel is optional, but `generatePath` won't accept `path: undefined`
  //     // so use this to pass `{ pkgkey }` or `{ pkgkey, panel }`
  //     const params = Object.assign({ pkgkey: `${name}-${version}` }, panel ? { panel } : {});
  //     const path = generatePath(patterns.DETAIL_VIEW, params);
  //     return withAppRoot ? appRoot(path) : path;
  //   },
  // };

  // XXX this is totally broken, only goal is to get the code running
  return {
    toAssets: (path: string) => `/really/WRONG.PLUGIN.ID}/assets/${path}`,
    toImage: (path: string) => getFilePath(path),
    toRelativeImage: ({
      path,
      packageName,
      version,
    }: {
      path: string;
      packageName: string;
      version: string;
    }) => {
      const imagePath = removeRelativePath(path);
      const pkgkey = `${packageName}-${version}`;
      const filePath = `${getInfoPath(pkgkey)}/${imagePath}`;
      return filePath;
    },
    toListView: () => appRoot(''),
    toDetailView: ({ name, version, panel, withAppRoot = true }: DetailParams) => {
      // panel is optional, but `generatePath` won't accept `path: undefined`
      // so use this to pass `{ pkgkey }` or `{ pkgkey, panel }`
      const params = Object.assign({ pkgkey: `${name}-${version}` }, panel ? { panel } : {});
      const path = generatePath('/no/DETAIL_VIEW/', params);
      return withAppRoot ? appRoot(path) : path;
    },
  };
}
