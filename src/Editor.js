import React, {useEffect, useRef, useState} from 'react';
import CodeEditor from '@monaco-editor/react';
import {Range} from "monaco-editor";

function getLocationFromCodeOffset(code, offset) {
    let line = 1;
    let column = 1;

    for (let i = 0; i < offset; i++) {
        if (code[i] === '\n') {
            line++;
            column = 1;
        } else {
            column++;
        }
    }

    return { line, column };
}

function getIssueClassName(issue) {
    switch (issue.level.toLowerCase()) {
        case "error":
            return 'squiggly-error';
        case "warning":
            return 'squiggly-warning';
        case "note":
            return 'squiggly-info';
        case "help":
            return 'squiggly-hint';
        default:
            return 'squiggly-hint';
    }
}

function useEditorErrorDecorator(code, issues)
{
    const editorRef = useRef();
    const [decorations, setDecorations] = useState([]);
    const [initialized, setInitialized] = useState(false);

    const markEditorAsInitialized = (editor) => {
        editorRef.current = editor;
        setInitialized(true);
    }

    useEffect(() => {
        calculateErrors();
    }, [code, issues, initialized]);

    const calculateErrors = () => {
        if (!editorRef.current || !issues || !code || !initialized) {
            console.log('No valid state', {ref: editorRef.current, issues, code})
            return;
        }

        const model = editorRef.current.getModel();
        if (!model) {
            return
        }

        const parseIssues = issues?.parse ? [issues.parse] : [];
        const semanticIssues = issues?.semantics || [];
        const lintIssues = issues?.lint || [];
        const allIssues = [...parseIssues, ...semanticIssues, ...lintIssues];

        const calculatedDecorations = allIssues.flatMap(issue => {
            const level = issue.level?.toLowerCase?.() || 'note';

            const firstAnnotation = (issue.annotations ?? [])[0];
            if (!firstAnnotation) {
                return [];
            }

            const start = getLocationFromCodeOffset(code, firstAnnotation.span.start.offset);
            const end = getLocationFromCodeOffset(code, firstAnnotation.span.end.offset);

            return [{
                range: new Range(start.line, start.column, end.line, end.column),
                options: {
                    className: getIssueClassName(issue),
                    hoverMessage: [
                        {value: '`' + level + '`: ' + issue.message + ' <em>(' + issue.code + ')</em>', supportHtml: true },
                    ],
                },
            }];
        });

        setDecorations(model.deltaDecorations(decorations, calculatedDecorations));
    }

    return {markEditorAsInitialized};
}

function useTheme() {
    const availableThemes = {
        light: 'vs-light',
        dark: 'vs-dark',
    }
    const selectTheme = (isLight) => isLight ? availableThemes.light : availableThemes.dark;
    const [theme, setTheme] = useState(
        selectTheme(window.matchMedia('(prefers-color-scheme: light)').matches)
    );

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', event => {
        setTheme(selectTheme(event.matches));
    });

    return theme;
}

export function Editor({code, setCode, issues}) {
    const {markEditorAsInitialized} = useEditorErrorDecorator(code, issues);
    const theme = useTheme();

    return (
        <CodeEditor
            value={code}
            language="php"
            placeholder="Enter PHP code here..."
            onChange={(value) => {
                setCode(value);
            }}
            options={{
                minimap: {enabled: false},
                theme,
            }}
            style={{
                backgroundColor: "transparent",
                fontFamily: "Fira Code, monospace",
                fontSize: 14,
            }}
            padding={16}
            onMount={markEditorAsInitialized}
        />
    );
}

export function ReadonlyEditor({code}) {
    const theme = useTheme();

    return (
        <CodeEditor
            value={code}
            language="php"
            options={{
                minimap: {enabled: false},
                readOnly: true,
                theme,
            }}
            style={{
                backgroundColor: "transparent",
                fontFamily: "Fira Code, monospace",
                fontSize: 14,
            }}
            padding={16}
        />
    );
}
