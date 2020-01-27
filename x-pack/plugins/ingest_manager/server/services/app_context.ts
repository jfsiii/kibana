/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { ICustomClusterClient } from 'kibana/server';
import { IngestManagerAppContext } from '../plugin';
import { PluginSetupContract as SecurityPluginSetup } from '../../../security/server';

class AppContextService {
  private clusterClient: ICustomClusterClient | undefined;
  private security: SecurityPluginSetup | undefined;

  public start(appContext: IngestManagerAppContext) {
    this.clusterClient = appContext.clusterClient;
    this.security = appContext.security;
  }

  public stop() {
    if (this.clusterClient) {
      this.clusterClient.close();
    }
  }

  public getClusterClient() {
    return this.clusterClient;
  }

  public getSecurity() {
    return this.security;
  }
}

export const appContextService = new AppContextService();
