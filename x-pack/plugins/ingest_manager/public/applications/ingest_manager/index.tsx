/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { EuiErrorBoundary } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { AppMountParameters, CoreStart } from 'kibana/public';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { useObservable } from 'react-use';
import { EuiThemeProvider } from '../../../../../legacy/common/eui_styled_components';
import {
  IngestManagerConfigType,
  IngestManagerSetupDeps,
  IngestManagerStartDeps,
} from '../../plugin';
import { Error, Loading } from './components';
import { AGENT_CONFIG_PATH, EPM_PATH, FLEET_PATH } from './constants';
import { ConfigContext, CoreContext, DepsContext, setHttpClient, useConfig } from './hooks';
import { sendSetup } from './hooks/use_request/setup';
import { DefaultLayout, WithoutHeaderLayout } from './layouts';
import { AgentConfigApp, EPMApp, FleetApp, IngestManagerOverview } from './sections';
import { PackageInstallProvider } from './sections/epm/hooks';

export interface ProtectedRouteProps extends RouteProps {
  isAllowed?: boolean;
  restrictedPath?: string;
}

export const ProtectedRoute: React.FunctionComponent<ProtectedRouteProps> = ({
  isAllowed = false,
  restrictedPath = '/',
  ...routeProps
}: ProtectedRouteProps) => {
  return isAllowed ? <Route {...routeProps} /> : <Redirect to={{ pathname: restrictedPath }} />;
};

const IngestManagerRoutes = ({ ...rest }) => {
  const { epm, fleet } = useConfig();

  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      setIsInitialized(false);
      setInitializationError(null);
      try {
        const res = await sendSetup();
        if (res.error) {
          setInitializationError(res.error);
        }
      } catch (err) {
        setInitializationError(err);
      }
      setIsInitialized(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isInitialized || initializationError) {
    return (
      <EuiErrorBoundary>
        <DefaultLayout>
          <WithoutHeaderLayout>
            {initializationError ? (
              <Error
                title={
                  <FormattedMessage
                    id="xpack.ingestManager.initializationErrorMessageTitle"
                    defaultMessage="Unable to initialize Ingest Manager"
                  />
                }
                error={initializationError}
              />
            ) : (
              <Loading />
            )}
          </WithoutHeaderLayout>
        </DefaultLayout>
      </EuiErrorBoundary>
    );
  }

  return (
    <EuiErrorBoundary>
      <Router {...rest}>
        <Switch>
          <ProtectedRoute path={EPM_PATH} isAllowed={epm.enabled}>
            <DefaultLayout section="epm">
              <EPMApp />
            </DefaultLayout>
          </ProtectedRoute>
          <Route path={AGENT_CONFIG_PATH}>
            <DefaultLayout section="agent_config">
              <AgentConfigApp />
            </DefaultLayout>
          </Route>
          <ProtectedRoute path={FLEET_PATH} isAllowed={fleet.enabled}>
            <DefaultLayout section="fleet">
              <FleetApp />
            </DefaultLayout>
          </ProtectedRoute>
          <Route exact path="/">
            <DefaultLayout section="overview">
              <IngestManagerOverview />
            </DefaultLayout>
          </Route>
          <Redirect to="/" />
        </Switch>
      </Router>
    </EuiErrorBoundary>
  );
};

const IngestManagerApp = ({
  basepath,
  coreStart,
  setupDeps,
  startDeps,
  config,
}: {
  basepath: string;
  coreStart: CoreStart;
  setupDeps: IngestManagerSetupDeps;
  startDeps: IngestManagerStartDeps;
  config: IngestManagerConfigType;
}) => {
  const isDarkMode = useObservable<boolean>(coreStart.uiSettings.get$('theme:darkMode'));
  return (
    <coreStart.i18n.Context>
      <CoreContext.Provider value={coreStart}>
        <DepsContext.Provider value={{ setup: setupDeps, start: startDeps }}>
          <ConfigContext.Provider value={config}>
            <EuiThemeProvider darkMode={isDarkMode}>
              <PackageInstallProvider notifications={coreStart.notifications}>
                <IngestManagerRoutes basepath={basepath} />
              </PackageInstallProvider>
            </EuiThemeProvider>
          </ConfigContext.Provider>
        </DepsContext.Provider>
      </CoreContext.Provider>
    </coreStart.i18n.Context>
  );
};

export function renderApp(
  coreStart: CoreStart,
  { element, appBasePath }: AppMountParameters,
  setupDeps: IngestManagerSetupDeps,
  startDeps: IngestManagerStartDeps,
  config: IngestManagerConfigType
) {
  setHttpClient(coreStart.http);
  ReactDOM.render(
    <IngestManagerApp
      basepath={appBasePath}
      coreStart={coreStart}
      setupDeps={setupDeps}
      startDeps={startDeps}
      config={config}
    />,
    element
  );

  return () => {
    ReactDOM.unmountComponentAtNode(element);
  };
}
