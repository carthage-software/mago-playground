import React from 'react';
import {FiX} from "react-icons/fi";
import Plugins from "./Plugins";
import PhpVersion from "./PhpVersion";

function Settings({onPhpVersionChange, onPluginsChanged, opened, onClose}) {
    return (
        <div className={`settings-panel ${opened ? 'open' : ''}`}>
            <div className="settings-header">
                <h3>Settings</h3>
                <FiX
                    className="close-icon"
                    onClick={onClose}
                />
            </div>

            <PhpVersion onVersionChange={onPhpVersionChange}/>
            <Plugins onPluginsChanged={onPluginsChanged}/>
        </div>
    );
}

export default Settings;
