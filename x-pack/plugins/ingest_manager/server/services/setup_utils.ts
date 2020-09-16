/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// the promise which tracks the setup
let status: Promise<any> | undefined;
let isPending = false;
// default resolve to guard against "undefined is not a function" errors
let onResolve = (value?: unknown) => {};
let onReject = (reason: any) => {};

export async function awaitIfPending<T>(asyncFunction: Function): Promise<T> {
  console.log('awaitIfPending called');
  // pending successful or failed attempt
  if (isPending) {
    // don't run concurrent installs
    // return a promise which will eventually resolve/reject
    console.log('awaitIfPending isPending');
    console.log('awaitIfPending return a promise which will resolve/reject', status);
    return status;
  } else {
    // create the initial promise
    status = new Promise((res, rej) => {
      isPending = true;
      onResolve = res;
      onReject = rej;
    });
  }
  try {
    console.log('awaitIfPending try');
    const result = await asyncFunction().catch(onReject);
    console.log('awaitIfPending ok. result:', result);
    console.log('awaitIfPending onResolve(result)');
    onResolve(result);
  } catch (error) {
    // if something fails
    console.log('awaitIfPending catch', error);
    console.log('awaitIfPending onReject(error)');
    onReject(error);
  }
  isPending = false;
  console.log('awaitIfPending isPending=false', isPending);
  console.log('awaitIfPending end. return a promise which will resolve/reject', status);
  return status;
}
