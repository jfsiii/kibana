/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { HttpFetchQuery } from 'kibana/public';
import { agentConfigRouteService } from '../../services';
import {
  CreateAgentConfigRequest,
  CreateAgentConfigResponse,
  DeleteAgentConfigsRequest,
  DeleteAgentConfigsResponse,
  GetAgentConfigsResponse,
  GetOneAgentConfigResponse,
  UpdateAgentConfigRequest,
  UpdateAgentConfigResponse,
} from '../../types';
import { sendRequest, useRequest } from './use_request';

export const useGetAgentConfigs = (query: HttpFetchQuery = {}) => {
  return useRequest<GetAgentConfigsResponse>({
    path: agentConfigRouteService.getListPath(),
    method: 'get',
    query,
  });
};

export const useGetOneAgentConfig = (agentConfigId: string) => {
  return useRequest<GetOneAgentConfigResponse>({
    path: agentConfigRouteService.getInfoPath(agentConfigId),
    method: 'get',
  });
};

export const sendGetOneAgentConfig = (agentConfigId: string) => {
  return sendRequest<GetOneAgentConfigResponse>({
    path: agentConfigRouteService.getInfoPath(agentConfigId),
    method: 'get',
  });
};

export const sendCreateAgentConfig = (body: CreateAgentConfigRequest['body']) => {
  return sendRequest<CreateAgentConfigResponse>({
    path: agentConfigRouteService.getCreatePath(),
    method: 'post',
    body: JSON.stringify(body),
  });
};

export const sendUpdateAgentConfig = (
  agentConfigId: string,
  body: UpdateAgentConfigRequest['body']
) => {
  return sendRequest<UpdateAgentConfigResponse>({
    path: agentConfigRouteService.getUpdatePath(agentConfigId),
    method: 'put',
    body: JSON.stringify(body),
  });
};

export const sendDeleteAgentConfigs = (body: DeleteAgentConfigsRequest['body']) => {
  return sendRequest<DeleteAgentConfigsResponse>({
    path: agentConfigRouteService.getDeletePath(),
    method: 'post',
    body: JSON.stringify(body),
  });
};
