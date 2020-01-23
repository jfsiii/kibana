/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Observable, Subscription } from 'rxjs';
import { IngestManagerConfigType } from '../';

class ConfigService {
  private observable: Observable<IngestManagerConfigType> | null = null;
  private subscription: Subscription | null = null;
  private config: IngestManagerConfigType | null = null;

  private updateInformation(config: IngestManagerConfigType) {
    this.config = config;
  }

  public start(config$: Observable<IngestManagerConfigType>) {
    this.observable = config$;
    this.subscription = this.observable.subscribe(this.updateInformation.bind(this));
  }

  public stop() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public getconfig() {
    return this.config;
  }

  public getconfig$() {
    return this.observable;
  }
}

export const configService = new ConfigService();
