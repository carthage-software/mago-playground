/* tslint:disable */
/* eslint-disable */
/**
 * Returns an array (serialized to JS via [`JsValue`]) of **all** plugin
 * definitions and their associated rules.
 *
 * Each element in the returned array is a tuple:
 * `(PluginDefinition, Vec<RuleDefinition>)`.
 *
 * # Errors
 *
 * Returns a [`JsValue`] error if the serialization to
 * [`JsValue`] fails (unlikely).
 *
 * # Example (JS Usage)
 * ```js
 * import init, { mago_get_definitions } from 'mago_wasm';
 *
 * await init();
 * const defs = mago_get_definitions();
 * console.log(defs); // An array of plugin/rule definitions
 * ```
 */
export function mago_get_definitions(): any;
/**
 * Performs a full “analysis” of the given `code` string:
 * 1. **Parse** the PHP code and detect any syntax errors.
 * 2. **Lint** the code using the provided linter settings.
 * 3. **Optionally** format the code if `format_settings` is provided.
 *
 * Returns an [`AnalysisResults`] object (serialized to JS), which
 * contains any parse errors, semantic issues, linter issues, and
 * the formatted code (if no syntax errors were encountered).
 *
 * # Arguments
 *
 * * `code` - A string containing the PHP code to analyze.
 * * `format_settings` - A [`JsValue`] representing a
 *   [`FormatSettings`](mago_formatter::settings::FormatSettings)
 *   struct, or `null`/`undefined` to use the default settings.
 * * `linter_settings` - A [`JsValue`] representing a
 *   [`Settings`](mago_linter::settings::Settings) struct, or
 *   `null`/`undefined` to use the default settings (PHP 8.4).
 *
 * # Errors
 *
 * Returns a [`JsValue`] (string) error if deserialization of
 * the provided settings fails, or if parsing/analysis fails.
 *
 * # Example (JS Usage)
 * ```js
 * import init, { mago_analysis } from 'mago_wasm';
 *
 * await init();
 * const code = `<?php echo "Hello World"; ?>`;
 * const formatSettings = { indent_size: 2 };
 * const linterSettings = { php_version: "8.1" };
 *
 * const analysis = mago_analysis(code, formatSettings, linterSettings);
 * console.log(analysis); // { parse_error: null, linter_issues: [...], formatted: "...", etc. }
 * ```
 */
export function mago_analysis(code: string, format_settings: any, linter_settings: any): any;
/**
 * Formats the provided `code` string with the given
 * [`FormatSettings`], returning the resulting string.
 *
 * # Arguments
 *
 * * `code` - The PHP code to be formatted.
 * * `format_settings` - A [`JsValue`] representing
 *   a [`FormatSettings`](mago_formatter::settings::FormatSettings)
 *   struct, or `null`/`undefined` to use defaults.
 *
 * # Errors
 *
 * Returns a [`JsValue`] (string) error if the code is invalid
 * (i.e., parse error) or if deserialization of `format_settings` fails.
 *
 * # Example (JS Usage)
 * ```js
 * import init, { mago_format } from 'mago_wasm';
 *
 * await init();
 * const code = `<?php echo "Hello"; ?>`;
 * const fmtSet = { indent_size: 4, max_line_length: 100 };
 *
 * try {
 *   const formatted = mago_format(code, fmtSet);
 *   console.log(formatted);
 * } catch (e) {
 *   console.error("Formatting failed:", e);
 * }
 * ```
 */
export function mago_format(code: string, format_settings: any): any;
