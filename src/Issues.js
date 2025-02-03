import React from 'react';

function Issue({issue}) {
    const level = issue.level?.toLowerCase?.() || "note";
    return (
        <div className={`issue-card level-${level}`}>
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
}

function Issues({issues}) {
    if (!issues){
        return null;
    }

    const parseIssues = issues.parse ? [issues.parse] : [];
    const semanticIssues = issues.semantics || [];
    const lintIssues = issues.lint || [];
    const allIssues = [...parseIssues, ...semanticIssues, ...lintIssues];

    return (
        <div className="issues-container">
            {allIssues.map((issue, i) => (<Issue issue={issue} key={"issue" + i} />))}
        </div>
    );
}

export default Issues;
