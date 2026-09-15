/**
 * CLI Test Runner for Module 1: Authentication and Authorization
 * Usage: npm run test:auth
 */

// Polyfill localStorage for Node CLI execution
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, String(value)),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
};

import { runAuthTestSuite } from '../src/services/__tests__/auth.test';

async function main() {
  console.log('================================================================');
  console.log(' HRM Enterprise Platform - Module 1: Auth & Security Test Suite');
  console.log('================================================================\n');

  const results = await runAuthTestSuite();
  let allPassed = true;

  for (const r of results) {
    const icon = r.status === 'passed' ? '✓ PASS' : '✗ FAIL';
    console.log(`${icon} [${r.id}] ${r.name} (${r.durationMs}ms)`);
    if (r.status !== 'passed') {
      console.log(`       Reason: ${r.message}`);
      allPassed = false;
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Total: ${results.length} | Passed: ${results.filter(r => r.status === 'passed').length} | Failed: ${results.filter(r => r.status !== 'passed').length}`);
  console.log('----------------------------------------------------------------\n');

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
