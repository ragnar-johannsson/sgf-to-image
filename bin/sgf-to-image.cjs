#!/usr/bin/env node

/**
 * CLI executable for sgf-to-image
 * Delegates to the main CLI implementation in src/cli.ts
 */

const { main } = require('../dist/cli.cjs')

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
