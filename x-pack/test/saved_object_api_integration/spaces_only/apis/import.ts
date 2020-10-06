/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SPACES } from '../../common/lib/spaces';
import { testCaseFailures, getTestScenarios } from '../../common/lib/saved_object_test_utils';
import { FtrProviderContext } from '../../common/ftr_provider_context';
import { importTestSuiteFactory, TEST_CASES as CASES } from '../../common/suites/import';

const {
  DEFAULT: { spaceId: DEFAULT_SPACE_ID },
  SPACE_1: { spaceId: SPACE_1_ID },
  SPACE_2: { spaceId: SPACE_2_ID },
} = SPACES;
const { fail400, fail409 } = testCaseFailures;
const destinationId = (condition?: boolean) =>
  condition !== false ? { successParam: 'destinationId' } : {};
const newCopy = () => ({ successParam: 'createNewCopy' });
const ambiguousConflict = (suffix: string) => ({
  failure: 409 as 409,
  fail409Param: `ambiguous_conflict_${suffix}`,
});

const createNewCopiesTestCases = () => {
  // for each outcome, if failure !== undefined then we expect to receive
  // an error; otherwise, we expect to receive a success result
  const cases = Object.entries(CASES).filter(([key]) => key !== 'HIDDEN');
  return [
    ...cases.map(([, val]) => ({ ...val, successParam: 'createNewCopies' })),
    { ...CASES.HIDDEN, ...fail400() },
  ];
};

const createTestCases = (overwrite: boolean, spaceId: string) => {
  // for each outcome, if failure !== undefined then we expect to receive
  // an error; otherwise, we expect to receive a success result
  const group1 = [
    // when overwrite=true, all of the objects in this group are created successfully, so we can check the created object attributes
    {
      ...CASES.SINGLE_NAMESPACE_DEFAULT_SPACE,
      ...fail409(!overwrite && spaceId === DEFAULT_SPACE_ID),
    },
    { ...CASES.SINGLE_NAMESPACE_SPACE_1, ...fail409(!overwrite && spaceId === SPACE_1_ID) },
    { ...CASES.SINGLE_NAMESPACE_SPACE_2, ...fail409(!overwrite && spaceId === SPACE_2_ID) },
    { ...CASES.MULTI_NAMESPACE_ALL_SPACES, ...fail409(!overwrite) },
    {
      ...CASES.MULTI_NAMESPACE_DEFAULT_AND_SPACE_1,
      ...fail409(!overwrite && (spaceId === DEFAULT_SPACE_ID || spaceId === SPACE_1_ID)),
      ...destinationId(spaceId !== DEFAULT_SPACE_ID && spaceId !== SPACE_1_ID),
    },
    {
      ...CASES.MULTI_NAMESPACE_ONLY_SPACE_1,
      ...fail409(!overwrite && spaceId === SPACE_1_ID),
      ...destinationId(spaceId !== SPACE_1_ID),
    },
    {
      ...CASES.MULTI_NAMESPACE_ONLY_SPACE_2,
      ...fail409(!overwrite && spaceId === SPACE_2_ID),
      ...destinationId(spaceId !== SPACE_2_ID),
    },
    { ...CASES.NAMESPACE_AGNOSTIC, ...fail409(!overwrite) },
    { ...CASES.HIDDEN, ...fail400() },
    { ...CASES.CONFLICT_1A_OBJ, ...newCopy() }, // "ambiguous source" conflict which results in a new destination ID and empty origin ID
    { ...CASES.CONFLICT_1B_OBJ, ...newCopy() }, // "ambiguous source" conflict which results in a new destination ID and empty origin ID
    { ...CASES.CONFLICT_3A_OBJ, ...fail409(!overwrite), ...destinationId() }, // "inexact match" conflict
    { ...CASES.CONFLICT_4_OBJ, ...fail409(!overwrite), ...destinationId() }, // "inexact match" conflict
    CASES.NEW_SINGLE_NAMESPACE_OBJ,
    CASES.NEW_MULTI_NAMESPACE_OBJ,
    CASES.NEW_NAMESPACE_AGNOSTIC_OBJ,
  ];
  const group2 = [
    // when overwrite=true, all of the objects in this group are errors, so we cannot check the created object attributes
    // grouping errors together simplifies the test suite code
    { ...CASES.CONFLICT_2C_OBJ, ...ambiguousConflict('2c') }, // "ambiguous destination" conflict
  ];
  const group3 = [
    // when overwrite=true, all of the objects in this group are created successfully, so we can check the created object attributes
    { ...CASES.CONFLICT_1_OBJ, ...fail409(!overwrite) }, // "exact match" conflict
    CASES.CONFLICT_1A_OBJ, // no conflict because CONFLICT_1_OBJ is an exact match
    CASES.CONFLICT_1B_OBJ, // no conflict because CONFLICT_1_OBJ is an exact match
    { ...CASES.CONFLICT_2C_OBJ, ...newCopy() }, // "ambiguous source and destination" conflict which results in a new destination ID and empty origin ID
    { ...CASES.CONFLICT_2D_OBJ, ...newCopy() }, // "ambiguous source and destination" conflict which results in a new destination ID and empty origin ID
  ];
  return { group1, group2, group3 };
};

export default function ({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');
  const es = getService('legacyEs');

  const { addTests, createTestDefinitions } = importTestSuiteFactory(es, esArchiver, supertest);
  const createTests = (overwrite: boolean, createNewCopies: boolean, spaceId: string) => {
    const singleRequest = true;
    if (createNewCopies) {
      const cases = createNewCopiesTestCases();
      return createTestDefinitions(cases, false, { createNewCopies, spaceId, singleRequest });
    }

    const { group1, group2, group3 } = createTestCases(overwrite, spaceId);
    return [
      createTestDefinitions(group1, false, { overwrite, spaceId, singleRequest }),
      createTestDefinitions(group2, false, { overwrite, spaceId, singleRequest }),
      createTestDefinitions(group3, false, { overwrite, spaceId, singleRequest }),
    ].flat();
  };

  describe('_import', () => {
    getTestScenarios([
      [false, false],
      [false, true],
      [true, false],
    ]).spaces.forEach(({ spaceId, modifier }) => {
      const [overwrite, createNewCopies] = modifier!;
      const suffix = overwrite
        ? ' with overwrite enabled'
        : createNewCopies
        ? ' with createNewCopies enabled'
        : '';
      const tests = createTests(overwrite, createNewCopies, spaceId);
      addTests(`within the ${spaceId} space${suffix}`, { spaceId, tests });
    });
  });
}
