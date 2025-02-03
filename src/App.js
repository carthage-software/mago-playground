import React, {useState, useEffect} from "react";
import {
  FiSettings,
  FiCode,
  FiGithub,
} from "react-icons/fi";
import lzstring from "lz-string";
import examples from "./examples";
import { performAnalysis } from "./services/linter";
import "./App.css";
import {Editor, ReadonlyEditor} from "./Editor";
import {useDebouncedCallback} from "@react-hookz/web";
import Issues from "./Issues";
import Settings from "./Settings";
import {grabHash, replaceHash} from "./services/url";
import {defaultPhpVersion} from "./PhpVersion";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [phpVersion, setPhpVersion] = useState(defaultPhpVersion);
  const [code, setCode] = useState("");
  const [formattedCode, setFormattedCode] = useState("");
  const [hasFormattingError, setHasFormattingError] = useState(false);
  const [selectedExample, setSelectedExample] = useState("");
  const [plugins, setPlugins] = useState([]);
  const [issues, setIssues] = useState({parse: [], semantics: [], lint: []});

  useEffect(() => {
    analyzeCode(code);
  }, [phpVersion, plugins]);

  useEffect(() => {
    if (grabHash().startsWith('#code')) {
      const code = grabHash().replace('#code/', '').trim()
      let userCode = lzstring.decompressFromEncodedURIComponent(code) || lzstring.decompressFromEncodedURIComponent(decodeURIComponent(code));

      loadCode(userCode);

      return;
    }

    if (grabHash().startsWith('#example')) {
        const exampleKey = grabHash().replace('#example/', '').trim()
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
          replaceHash('example/' + exampleName);
          return;
        }
      }

      replaceHash('code/' + lzstring.compressToEncodedURIComponent(input));
    }
  };

  const submitCodeAnalysisWhilstTyping = useDebouncedCallback(analyzeCode, [analyzeCode], 250);

  const loadCode = (code) => {
    setCode(code);
    analyzeCode(code);
  }

  const handleExampleSelect = (exampleKey) => {
    const example = examples[exampleKey];
    if (example) {
      loadCode(example.content);
      setSelectedExample(exampleKey);
      replaceHash('example/' + exampleKey);
    }
  };

  return (
    <div className={`app-container`}>
      <Settings
          opened={isSettingsOpen}
          onPluginsChanged={setPlugins}
          onPhpVersionChange={setPhpVersion}
          onClose={() => setIsSettingsOpen(false)}
      />
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
              <Editor
                code={code}
                setCode={(code) => {
                  setCode(code);
                  submitCodeAnalysisWhilstTyping(code);
                }}
                issues={issues}
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
                <ReadonlyEditor code={formattedCode} resizeDeps={[isSettingsOpen]} />
              )}
            </div>
          </div>
        </div>

        <Issues issues={issues} />
      </div>
    </div>
  );
}
