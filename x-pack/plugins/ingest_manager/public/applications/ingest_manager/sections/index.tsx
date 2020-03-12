/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
export { AgentConfigApp } from './agent_config';
export { EPMApp } from './epm';
export { FleetApp } from './fleet';
export { IngestManagerOverview } from './overview';

export type Section = 'overview' | 'epm' | 'agent_config' | 'fleet';
