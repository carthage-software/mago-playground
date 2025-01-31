import React, { useState, useEffect } from "react";
import decamelize from "decamelize";
import {
  FiSettings,
  FiCode,
  FiX,
  FiCheckSquare,
  FiSquare,
  FiChevronDown,
  FiChevronLeft,
  FiSun,
  FiMoon,
  FiGithub,
} from "react-icons/fi";
import CodeEditor from "@uiw/react-textarea-code-editor";
import lzstring from "lz-string";
import examples from "./examples";
import { getLinterDefinitions, performAnalysis } from "./services/linter";

import "./App.css";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [phpVersion, setPhpVersion] = useState("8.4");
  const [code, setCode] = useState("");
  const [formattedCode, setFormattedCode] = useState("");
  const [hasFormattingError, setHasFormattingError] = useState(false);
  const [selectedExample, setSelectedExample] = useState("");
  const [plugins, setPlugins] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    analyzeCode(code);
  }, [phpVersion, plugins]);

  useEffect(() => {
    const toSlug = (str) =>
      decamelize(str, { separator: "-" }).replace(/ /g, "-");
    const pluginDefs = getLinterDefinitions().map(([plugin, rules]) => ({
      name: plugin.name,
      slug: toSlug(plugin.name),
      enabled: plugin.enabled_by_default,
      expanded: false,
      rules: rules.map((rule) => ({
        name: rule.name,
        slug: `${toSlug(plugin.name)}/${toSlug(rule.name)}`,
        enabled: rule.level !== undefined,
        level: rule.level,
      })),
    }));
    setPlugins(pluginDefs);
  }, []);

  useEffect(() => {
    if (location.hash.startsWith('#code')) {
      const code = location.hash.replace('#code/', '').trim()
      let userCode = lzstring.decompressFromEncodedURIComponent(code) || lzstring.decompressFromEncodedURIComponent(decodeURIComponent(code));

      loadCode(userCode);

      return;
    }

    if (location.hash.startsWith('#example')) {
        const exampleKey = location.hash.replace('#example/', '').trim()
        handleExampleSelect(exampleKey);

        return;
    }

    if (Object.keys(examples).length > 0) {
      handleExampleSelect(Object.keys(examples)[0]);
    }
  }, []);

  const analyzeCode = (input) => {
    const formatterSettings = null;
    const linterSettings = {
      php_version: phpVersion,
      default_plugins: false,
      plugins: [],
      rules: {},
    };

    plugins.forEach((plugin) => {
      if (!plugin.enabled) return;
      linterSettings.plugins.push(plugin.slug);
      plugin.rules.forEach((rule) => {
        linterSettings.rules[rule.slug] = {
          enabled: rule.enabled,
          level: rule.level,
          options: {},
        };
      });
    });

    const analysis = performAnalysis(input, formatterSettings, linterSettings);
    const hasParseError = !!analysis.parse_error;

    setIssues({
      parse: analysis.parse_error,
      semantics: analysis.semantic_issues,
      lint: analysis.linter_issues,
    });

    setFormattedCode(analysis.formatted || "");
    setHasFormattingError(hasParseError);

    if (input) {
      for(const exampleName in examples) {
        if (examples[exampleName].content === input) {
          window.location.hash = '#example/' + exampleName;
          return;
        }
      }

      window.location.hash = '#code/' + lzstring.compressToEncodedURIComponent(input);
    }
  };

  const loadCode = (code) => {
    setCode(code);
    analyzeCode(code);
  }

  const handleExampleSelect = (exampleKey) => {
    const example = examples[exampleKey];
    if (example) {
      loadCode(example.content);
      setSelectedExample(exampleKey);
      window.location.hash = '#example/' + exampleKey;
    }
  };

  const togglePlugin = (pluginName) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.name === pluginName ? { ...p, enabled: !p.enabled } : p,
      ),
    );
  };

  const togglePluginExpand = (pluginName) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.name === pluginName ? { ...p, expanded: !p.expanded } : p,
      ),
    );
  };

  const toggleRule = (pluginName, ruleName) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.name === pluginName
          ? {
              ...p,
              rules: p.rules.map((r) =>
                r.name === ruleName ? { ...r, enabled: !r.enabled } : r,
              ),
            }
          : p,
      ),
    );
  };

  const renderSettingsPanel = () => {
    return (
      <div className={`settings-panel ${isSettingsOpen ? "open" : ""}`}>
        <div className="settings-header">
          <h3>Settings</h3>
          <FiX
            className="close-icon"
            onClick={() => setIsSettingsOpen(false)}
          />
        </div>

        {/* PHP Version */}
        <div className="settings-block">
          <div className="settings-title">PHP Version</div>
          <select
            className="php-version-select"
            value={phpVersion}
            onChange={(e) => setPhpVersion(e.target.value)}
          >
            {["7.4", "8.0", "8.1", "8.2", "8.3", "8.4"].map((v) => (
              <option key={v} value={v}>
                PHP {v}
              </option>
            ))}
          </select>
        </div>

        {/* Plugins and Rules */}
        <div className="settings-block">
          <div className="settings-title">Plugins &amp; Rules</div>
          {plugins.map((plugin) => (
            <div key={plugin.name} className="plugin-container">
              {/* Plugin Header */}
              <div className="plugin-header">
                <div
                  className={`plugin-toggle ${
                    plugin.enabled ? "enabled" : "disabled"
                  }`}
                  onClick={() => togglePlugin(plugin.name)}
                >
                  <div className="plugin-name">{plugin.name}</div>
                  {plugin.enabled ? (
                    <FiCheckSquare className="plugin-icon check" />
                  ) : (
                    <FiSquare className="plugin-icon" />
                  )}
                </div>
                <div
                  className="plugin-expand"
                  onClick={() => togglePluginExpand(plugin.name)}
                >
                  {plugin.expanded ? <FiChevronDown /> : <FiChevronLeft />}
                </div>
              </div>
              {/* Rules List */}
              <div
                className="rule-list"
                style={{
                  maxHeight: plugin.expanded ? "500px" : "0px",
                  transition: "max-height 0.3s ease",
                }}
              >
                {plugin.rules.map((rule) => (
                  <div
                    key={rule.name}
                    className={`rule-item ${
                      rule.enabled ? "enabled" : "disabled"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRule(plugin.name, rule.name);
                    }}
                  >
                    <div className="rule-name">{rule.name}</div>
                    {rule.enabled ? (
                      <FiCheckSquare className="rule-icon check" />
                    ) : (
                      <FiSquare className="rule-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderIssue = (issue, idx) => {
    const level = issue.level?.toLowerCase?.() || "note";
    return (
      <div className={`issue-card level-${level}`} key={idx}>
        <div className="issue-top">
          <span className="issue-level">{issue.level}</span>
          <span className="issue-code">{issue.code}</span>
        </div>
        <div className="issue-message">{issue.message}</div>
        {issue.notes?.length > 0 && (
          <div className="issue-notes">
            {issue.notes.map((note, i) => (
              <div className="issue-note" key={i}>
                {note}
              </div>
            ))}
          </div>
        )}
        {issue.help && <div className="issue-help">{issue.help}</div>}
        {issue.annotations
          ?.filter((ann) => ann.message)
          ?.map((ann, i) => (
            <div className="issue-annotation" key={i}>
              [{ann.span.start.offset}-{ann.span.end.offset}]
              {ann.message ? `: ${ann.message}` : ""}
            </div>
          ))}
      </div>
    );
  };

  const renderIssues = () => {
    if (!issues) return null;
    const parseIssues = issues.parse ? [issues.parse] : [];
    const semanticIssues = issues.semantics || [];
    const lintIssues = issues.lint || [];
    const allIssues = [...parseIssues, ...semanticIssues, ...lintIssues];

    return (
      <div className="issues-container">
        {allIssues.map((issue, i) => renderIssue(issue, i))}
      </div>
    );
  };

  return (
    <div className={`app-container`}>
      {renderSettingsPanel()}

      <div className={`main-panel`}>
        <div className="top-bar">
          <div className="top-left">
            <FiSettings
              className="icon-button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            />
            <button
              className="analyze-btn"
              onClick={() => {
                analyzeCode(code);
              }}
            >
              <FiCode />
              <span>Format & Analyze</span>
            </button>
            <select
              className="examples-select"
              value={selectedExample}
              onChange={(e) => handleExampleSelect(e.target.value)}
            >
              {Object.keys(examples).map((key) => (
                <option key={key} value={key}>
                  {examples[key].name}
                </option>
              ))}
            </select>
          </div>
          <div className="top-center"></div>
          <div className="top-right">
            <div
              style={{
                alignSelf: "end",
                display: "flex",
                gap: "1rem",
              }}
            >
              <a
                className="github-icon"
                href="https://github.com/carthage-software/mago"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiGithub label="GitHub" />
              </a>
            </div>
          </div>
        </div>

        <div className="editors-row">
          <div className="editor-section">
            <div className="editor-header">PHP Code</div>
            <div className="editor-wrapper">
              <CodeEditor
                value={code}
                language="php"
                placeholder="Enter PHP code here..."
                onChange={(evn) => {
                  setCode(evn.target.value);
                }}
                style={{
                  backgroundColor: "transparent",
                  fontFamily: "Fira Code, monospace",
                  fontSize: 14,
                }}
                padding={16}
              />
            </div>
          </div>

          <div className="editor-section">
            <div className="editor-header">Formatted Code</div>
            <div
              className={`editor-wrapper ${
                hasFormattingError ? "error-state" : ""
              }`}
            >
              {hasFormattingError ? (
                <div className="format-error">
                  There was an error formatting the code. Check for syntax
                  errors.
                </div>
              ) : (
                <CodeEditor
                  value={formattedCode}
                  language="php"
                  readOnly
                  style={{
                    backgroundColor: "transparent",
                    fontFamily: "Fira Code, monospace",
                    fontSize: 14,
                  }}
                  padding={16}
                />
              )}
            </div>
          </div>
        </div>

        {renderIssues()}
      </div>
    </div>
  );
}
