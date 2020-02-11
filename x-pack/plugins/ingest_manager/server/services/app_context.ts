/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { IClusterClient } from 'kibana/server';
import { IngestManagerAppContext } from '../plugin';
import { EncryptedSavedObjectsPluginStart } from '../../../encrypted_saved_objects/server';
import { SecurityPluginSetup } from '../../../security/server';

class AppContextService {
  private clusterClient: IClusterClient | undefined;
  private encryptedSavedObjects: EncryptedSavedObjectsPluginStart | undefined;
  private security: SecurityPluginSetup | undefined;

  public start(appContext: IngestManagerAppContext) {
    this.clusterClient = appContext.clusterClient;
    this.encryptedSavedObjects = appContext.encryptedSavedObjects;
    this.security = appContext.security;
  }

  public stop() {}

  public getClusterClient() {
    return this.clusterClient;
  }

  public getEncryptedSavedObjects() {
    return this.encryptedSavedObjects;
  }

  public getSecurity() {
    return this.security;
  }
}

export const appContextService = new AppContextService();
