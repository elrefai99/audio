// @ts-nocheck — auto-generated barrel with lazy CJS re-exports
/**
 * gen-import.ts — AUTO-GENERATED, do not edit manually.
 * Regenerate: npx gen-import
 *
 * Value exports use lazy getters to prevent circular-dependency
 * errors when source files import from this barrel (CJS).
 *
 * Getters are installed on module.exports, not exports: esbuild-based
 * loaders (tsx, bun) reassign module.exports for any file containing
 * export syntax, which would strand getters bound to exports.
 */

export declare const commands: typeof import('./cmd').commands;
export declare const MusicPlayer: typeof import('./provider').MusicPlayer;

Object.defineProperty(module.exports, 'commands', { get() { return require('./cmd').commands }, enumerable: true, configurable: true });
Object.defineProperty(module.exports, 'MusicPlayer', { get() { return require('./provider').MusicPlayer }, enumerable: true, configurable: true });
