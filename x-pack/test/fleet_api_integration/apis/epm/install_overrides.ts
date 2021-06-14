/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../api_integration/ftr_provider_context';
import { warnAndSkipTest } from '../../helpers';

export default function ({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const es = getService('es');
  const dockerServers = getService('dockerServers');
  const log = getService('log');

  const mappingsPackage = 'overrides-0.1.0';
  const server = dockerServers.get('registry');

  const deletePackage = async (pkgkey: string) =>
    supertest.delete(`/api/fleet/epm/packages/${pkgkey}`).set('kbn-xsrf', 'xxxx');

  describe('installs packages that include settings and mappings overrides', async () => {
    after(async () => {
      if (server.enabled) {
        // remove the package just in case it being installed will affect other tests
        await deletePackage(mappingsPackage);
      }
    });

    it('should install the overrides package correctly', async function () {
      if (server.enabled) {
        let { body } = await supertest
          .post(`/api/fleet/epm/packages/${mappingsPackage}`)
          .set('kbn-xsrf', 'xxxx')
          .expect(200);

        const templateName = body.response[0].id;

        ({ body } = await es.transport.request({
          method: 'GET',
          path: `/_index_template/${templateName}`,
        }));

        // make sure composed_of array has the correct component templates in the correct order
        expect(body.index_templates[0].index_template.composed_of).to.eql([
          `${templateName}-mappings`,
          `${templateName}-settings`,
          `${templateName}-user_settings`,
        ]);

        ({ body } = await es.transport.request({
          method: 'GET',
          path: `/_component_template/${templateName}-mappings`,
        }));

        // Make sure that the `dynamic` field exists and is set to false (as it is in the package)
        expect(body.component_templates[0].component_template.template.mappings.dynamic).to.be(
          false
        );

        ({ body } = await es.transport.request({
          method: 'GET',
          path: `/_component_template/${templateName}-settings`,
        }));

        // Make sure that the lifecycle name gets set correct in the settings
        expect(
          body.component_templates[0].component_template.template.settings.index.lifecycle.name
        ).to.be('reference');

        ({ body } = await es.transport.request({
          method: 'GET',
          path: `/_component_template/${templateName}-user_settings`,
        }));

        // Make sure that the lifecycle name gets set correct in the settings
        let storedTemplate = body.component_templates[0].component_template.template.settings;
        const stubTemplate = {};
        expect(storedTemplate).to.eql(stubTemplate);

        const userSettingsOverrides = {
          number_of_shards: 3,
          index: {
            lifecycle: { name: 'overridden by user' },
          },
        };

        ({ body } = await es.transport.request({
          method: 'PUT',
          path: `/_component_template/${templateName}-user_settings`,
          body: {
            template: { settings: userSettingsOverrides },
          },
        }));

        ({ body } = await es.transport.request({
          method: 'GET',
          path: `/_component_template/${templateName}-user_settings`,
        }));
        // templateName = 'logs-overrides.test';
        // console.log({ GET: JSON.stringify(body) });
        // Make sure that the lifecycle name gets set correct in the settings
        storedTemplate = body.component_templates[0].component_template.template.settings;
        expect(storedTemplate).to.eql({
          index: {
            number_of_shards: 3,
            lifecycle: { name: 'overridden by user' },
          },
        });
      } else {
        warnAndSkipTest(this, log);
      }
    });
  });
}
