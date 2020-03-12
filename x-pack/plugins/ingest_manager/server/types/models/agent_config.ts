/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { schema } from '@kbn/config-schema';
import { AgentConfigStatus } from '../../../common';
import { DatasourceSchema } from './datasource';

const AgentConfigBaseSchema = {
  name: schema.string(),
  namespace: schema.string(),
  description: schema.maybe(schema.string()),
};

export const NewAgentConfigSchema = schema.object({
  ...AgentConfigBaseSchema,
});

export const AgentConfigSchema = schema.object({
  ...AgentConfigBaseSchema,
  id: schema.string(),
  status: schema.oneOf([
    schema.literal(AgentConfigStatus.Active),
    schema.literal(AgentConfigStatus.Inactive),
  ]),
  datasources: schema.oneOf([schema.arrayOf(schema.string()), schema.arrayOf(DatasourceSchema)]),
  updated_on: schema.string(),
  updated_by: schema.string(),
});
