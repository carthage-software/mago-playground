import React, {useState, useEffect, useMemo} from "react";
import {
    FiCheckSquare,
    FiSquare,
    FiChevronDown,
    FiChevronLeft,
} from "react-icons/fi";
import "./App.css";
import decamelize from "decamelize";
import {getLinterDefinitions} from "./services";
import {grabSearchParams, replaceSearchParams} from "./services/url";

export default function Plugins({onPluginsChanged}) {
    const defaultPlugins = useMemo(() => {
        const toSlug = (str) =>
            decamelize(str, { separator: "-" }).replace(/ /g, "-");
        return getLinterDefinitions().map(([plugin, rules]) => ({
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
    }, []);
    const defaultPluginState = useMemo(() => Object.fromEntries(defaultPlugins.map(
        (plugin) => [plugin.slug, plugin.enabled]
    )), [defaultPlugins]);
    const defaultRuleState = useMemo(() => Object.fromEntries(defaultPlugins.flatMap(
        (plugin) => plugin.rules.map(
            (rule) => [rule.slug, rule.enabled]
        )
    )), [defaultPlugins]);
    const [plugins, setPlugins] = useState(defaultPlugins);

    const registerPlugins = (plugins) => {
        setPlugins(plugins);
        onPluginsChanged(plugins);

        const {excludedPlugins, includedPlugins, excludedRules, includedRules} = plugins.reduce((acc, plugin) => {
            const isPluginEnabledByDefault = defaultPluginState[plugin.slug];
            if (plugin.enabled !== isPluginEnabledByDefault) {
                if (plugin.enabled) {
                    acc.includedPlugins.push(plugin.slug);
                } else {
                    acc.excludedPlugins.push(plugin.slug);
                }
            }

            plugin.rules.forEach((rule) => {
                const isRuleEnabledByDefault = defaultRuleState[rule.slug];
                if (rule.enabled !== isRuleEnabledByDefault) {
                    if (rule.enabled) {
                        acc.includedRules.push(rule.slug);
                    } else {
                        acc.excludedRules.push(rule.slug);
                    }
                }
            });

            return acc;
        }, {
            excludedPlugins: [],
            includedPlugins: [],
            excludedRules: [],
            includedRules: []
        });

        replaceSearchParams({
            excludedPlugins: excludedPlugins.join(','),
            includedPlugins: includedPlugins.join(','),
            excludedRules: excludedRules.join(','),
            includedRules: includedRules.join(','),
        });
    }

    useEffect(() => {
        const urlParams = grabSearchParams();
        const excludedPlugins = urlParams.get('excludedPlugins')?.split(',') ?? [];
        const includedPlugins = urlParams.get('includedPlugins')?.split(',') ?? [];
        const excludedRules = urlParams.get('excludedRules')?.split(',') ?? [];
        const includedRules = urlParams.get('includedRules')?.split(',') ?? [];

        const queryEnhancedPlugins = defaultPlugins.map((previousPlugin) => {
            const newPlugin = {...previousPlugin}
            if (excludedPlugins.length && excludedPlugins.includes(newPlugin.slug)) {
                newPlugin.enabled = false;
            }

            if (includedPlugins.length && includedPlugins.includes(newPlugin.slug)) {
                newPlugin.enabled = true;
            }

            newPlugin.rules = newPlugin.rules.map((previousRule) => {
                const newRule = {...previousRule}
                if (excludedRules.length && excludedRules.includes(newRule.slug)) {
                    newRule.enabled = false;
                }

                if (includedRules.length && includedRules.includes(newRule.slug)) {
                    newRule.enabled = true;
                }

                return newRule;
            });

            return newPlugin
        });

        registerPlugins(queryEnhancedPlugins);
    }, [defaultPlugins]);

    const toggleRule = (pluginName, ruleName) => {
        registerPlugins(
            plugins.map((p) =>
                p.name === pluginName
                    ? {
                        ...p,
                        rules: p.rules.map((r) =>
                            r.name === ruleName ? { ...r, enabled: !r.enabled } : r,
                        ),
                    }
                    : p,
            )
        );
    };

    const togglePlugin = (pluginName) => {
        registerPlugins(
            plugins.map((p) =>
                p.name === pluginName ? { ...p, enabled: !p.enabled } : p,
            )
        );
    };

    const togglePluginExpand = (pluginName) => {
        registerPlugins(
            plugins.map((p) =>
                p.name === pluginName ? { ...p, expanded: !p.expanded } : p,
            )
        );
    };

    return (
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
                                <FiCheckSquare className="plugin-icon check"/>
                            ) : (
                                <FiSquare className="plugin-icon"/>
                            )}
                        </div>
                        <div
                            className="plugin-expand"
                            onClick={() => togglePluginExpand(plugin.name)}
                        >
                            {plugin.expanded ? <FiChevronDown/> : <FiChevronLeft/>}
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
                                    <FiCheckSquare className="rule-icon check"/>
                                ) : (
                                    <FiSquare className="rule-icon"/>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
