import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            exclude: ['node_modules', 'test', 'dist', 'build', 'cache', 'contracts', 'hardhat.config.ts', 'schema.ts', 'artifacts']
        }
    },
});