/* tslint:disable */
/* eslint-disable */
/**
 * Runs the full analysis pipeline (parse, semantics, lint, analyze, format).
 *
 * Takes a string of PHP code and a settings object, returning a comprehensive
 * analysis result.
 */
export function run(code: string, settings: any): any;
/**
 * Returns metadata for all available linter rules.
 *
 * This allows a UI to dynamically display available rules and their descriptions.
 */
export function getRules(linter_settings: any): any;
/**
 * Runs only the formatter on the given code.
 *
 * This is a lightweight function for callers who only need to format code
 * without performing a full analysis.
 */
export function formatCode(code: string, php_version: any, settings: any): string;
