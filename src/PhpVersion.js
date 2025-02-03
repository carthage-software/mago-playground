import React, {useEffect, useMemo, useState} from 'react';
import {grabSearchParams, replaceSearchParams} from "./services/url";

export const defaultPhpVersion = '8.4';

function PhpVersion({onVersionChange}) {

    const [phpVersion, setPhpVersion] = useState(defaultPhpVersion);

    useEffect(
        () => {
            const version = grabSearchParams().get('phpVersion') || defaultPhpVersion;
            save(version);
        },
        []
    )

    const save = (version) => {
        setPhpVersion(version);
        onVersionChange(version);

        replaceSearchParams({phpVersion: version});
    }

    return (
        <div className="settings-block">
            <div className="settings-title">PHP Version</div>
            <select
                className="php-version-select"
                value={phpVersion}
                onChange={(e) => save(e.target.value)}
            >
                {["7.4", "8.0", "8.1", "8.2", "8.3", "8.4"].map((v) => (
                    <option key={v} value={v}>
                        PHP {v}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default PhpVersion;
