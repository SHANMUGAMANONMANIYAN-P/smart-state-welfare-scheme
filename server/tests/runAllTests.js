import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('Running Test Suite: Smart Welfare Prediction Engine');
console.log('====================================================\n');

// 1. Eligibility Engine Unit Tests
console.log('>>> [1/2] Executing Eligibility Engine Unit Tests...');
const unitTest = spawnSync('node', [path.join(__dirname, 'eligibilityEngine.test.js')], { stdio: 'inherit' });
if (unitTest.status !== 0) {
  console.error('\n❌ Unit tests failed.');
  process.exit(1);
}

// 2. API Integration Tests
console.log('>>> [2/3] Executing Full API Integration Tests...');
const apiTest = spawnSync('node', [path.join(__dirname, 'api.test.js')], { stdio: 'inherit' });
if (apiTest.status !== 0) {
  console.error('\n❌ API integration tests failed.');
  process.exit(1);
}

// 3. Government Scheme Data Import Module Tests
console.log('>>> [3/3] Executing Government Scheme Data Import Module Tests...');
const importTest = spawnSync('node', [path.join(__dirname, 'importModule.test.js')], { stdio: 'inherit' });
if (importTest.status !== 0) {
  console.error('\n❌ Government scheme import tests failed.');
  process.exit(1);
}

console.log('\n====================================================');
console.log('🎉 ALL TEST SUITES PASSED CLEANLY AND COMPLETELY!');
console.log('====================================================');
process.exit(0);
