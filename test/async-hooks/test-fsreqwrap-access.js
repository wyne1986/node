'use strict';

const common = require('../common');
const assert = require('assert');
const tick = require('./tick');
const initHooks = require('./init-hooks');
const { checkInvocations } = require('./hook-checks');
const fs = require('fs');

const hooks = initHooks();

hooks.enable();
fs.access(__filename, common.mustCall(onaccess));

function onaccess() {
  const as = hooks.activitiesOfTypes('FSREQWRAP');
  const a = as[0];
  checkInvocations(a, { init: 1, before: 1 },
                   'while in onaccess callback');
  tick(2);
}

process.on('exit', onexit);

function onexit() {
  hooks.disable();
  hooks.sanityCheck('FSREQWRAP');

  const as = hooks.activitiesOfTypes('FSREQWRAP');
  assert.strictEqual(as.length, 1, 'one activity');

  const a = as[0];
  assert.strictEqual(a.type, 'FSREQWRAP', 'fs req wrap');
  assert.strictEqual(typeof a.uid, 'number', 'uid is a number');
  checkInvocations(a, { init: 1, before: 1, after: 1, destroy: 1 },
                   'when process exits');
}
