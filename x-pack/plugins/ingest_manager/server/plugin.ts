/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import {
  CoreSetup,
  CoreStart,
  Plugin,
  PluginInitializerContext,
  SavedObjectsServiceStart,
} from 'kibana/server';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { EncryptedSavedObjectsPluginStart } from '../../encrypted_saved_objects/server';
import { PluginSetupContract as FeaturesPluginSetup } from '../../features/server';
import { LicensingPluginSetup } from '../../licensing/server';
import { SecurityPluginSetup } from '../../security/server';
import { IngestManagerConfigType } from '../common';
import {
  AGENT_CONFIG_SAVED_OBJECT_TYPE,
  AGENT_EVENT_SAVED_OBJECT_TYPE,
  AGENT_SAVED_OBJECT_TYPE,
  DATASOURCE_SAVED_OBJECT_TYPE,
  ENROLLMENT_API_KEYS_SAVED_OBJECT_TYPE,
  OUTPUT_SAVED_OBJECT_TYPE,
  PACKAGES_SAVED_OBJECT_TYPE,
  PLUGIN_ID,
} from './constants';
import {
  registerAgentConfigRoutes,
  registerAgentRoutes,
  registerDatasourceRoutes,
  registerEnrollmentApiKeyRoutes,
  registerEPMRoutes,
  registerInstallScriptRoutes,
  registerSetupRoutes,
} from './routes';
import { appContextService } from './services';

export interface IngestManagerSetupDeps {
  licensing: LicensingPluginSetup;
  security?: SecurityPluginSetup;
  features?: FeaturesPluginSetup;
}

export interface IngestManagerAppContext {
  encryptedSavedObjects: EncryptedSavedObjectsPluginStart;
  security?: SecurityPluginSetup;
  config$?: Observable<IngestManagerConfigType>;
  savedObjects: SavedObjectsServiceStart;
}

const allSavedObjectTypes = [
  OUTPUT_SAVED_OBJECT_TYPE,
  AGENT_CONFIG_SAVED_OBJECT_TYPE,
  DATASOURCE_SAVED_OBJECT_TYPE,
  PACKAGES_SAVED_OBJECT_TYPE,
  AGENT_SAVED_OBJECT_TYPE,
  AGENT_EVENT_SAVED_OBJECT_TYPE,
  ENROLLMENT_API_KEYS_SAVED_OBJECT_TYPE,
];

export class IngestManagerPlugin implements Plugin {
  private config$: Observable<IngestManagerConfigType>;
  private security: SecurityPluginSetup | undefined;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.config$ = this.initializerContext.config.create<IngestManagerConfigType>();
  }

  public async setup(core: CoreSetup, deps: IngestManagerSetupDeps) {
    if (deps.security) {
      this.security = deps.security;
    }

    // Register feature
    // TODO: Flesh out privileges
    if (deps.features) {
      deps.features.registerFeature({
        id: PLUGIN_ID,
        name: 'Ingest Manager',
        icon: 'savedObjectsApp',
        navLinkId: PLUGIN_ID,
        app: [PLUGIN_ID, 'kibana'],
        privileges: {
          all: {
            api: [`${PLUGIN_ID}-read`, `${PLUGIN_ID}-all`],
            savedObject: {
              all: allSavedObjectTypes,
              read: [],
            },
            ui: ['show', 'read', 'write'],
          },
          read: {
            api: [`${PLUGIN_ID}-read`],
            savedObject: {
              all: [],
              read: allSavedObjectTypes,
            },
            ui: ['show', 'read'],
          },
        },
      });
    }

    const router = core.http.createRouter();
    const config = await this.config$.pipe(first()).toPromise();

    // Register routes
    registerAgentConfigRoutes(router);
    registerDatasourceRoutes(router);

    // Conditional routes
    if (config.epm.enabled) {
      registerEPMRoutes(router);
    }

    if (config.fleet.enabled) {
      registerSetupRoutes(router);
      registerAgentRoutes(router);
      registerEnrollmentApiKeyRoutes(router);
      registerInstallScriptRoutes({
        router,
        serverInfo: core.http.getServerInfo(),
        basePath: core.http.basePath,
      });
    }
  }

  public async start(
    core: CoreStart,
    plugins: {
      encryptedSavedObjects: EncryptedSavedObjectsPluginStart;
    }
  ) {
    appContextService.start({
      encryptedSavedObjects: plugins.encryptedSavedObjects,
      security: this.security,
      config$: this.config$,
      savedObjects: core.savedObjects,
    });
  }

  public async stop() {
    appContextService.stop();
  }
}
