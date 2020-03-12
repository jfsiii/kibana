/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { setupRouteService } from '../../services';
import { sendRequest } from './use_request';

export const sendSetup = () => {
  return sendRequest({
    path: setupRouteService.getSetupPath(),
    method: 'post',
  });
};
