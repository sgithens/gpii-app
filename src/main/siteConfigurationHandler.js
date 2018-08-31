/**
 * The site config handler
 *
 * Introduces a component that loads the "site config" and distributes its values.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");

// already added in app.js
// require("json5/lib/register");


/**
 * Take care of the "site configuration" for the gpii-app. It is responsible of loading the config
 * and distributing these options to the proper places. It translates the config values to the
 * proper options that the affected components use.
 */
fluid.defaults("gpii.app.siteConfigurationHandler", {
    gradeNames: ["fluid.component"],

    siteConfigPath: "%gpii-app/siteconfig.json5",
    siteConfig: "@expand:fluid.require({that}.options.siteConfigPath)",

    saveSettingPath: "save",

    distributeOptions: {
        distributeSaveSettings: {
            record: {
                expander: {
                    funcName: "gpii.app.siteConfigurationHandler.getSaveDistribution",
                    args: [
                        "{that}.options.saveSettingPath",
                        "{that}.options.siteConfig.disableQssSaveButton"
                    ]
                }
            },
            target: "{app qssWrapper}.options.settingOptions.disabledSettings"
        },
        distributeQssScaleFactor: {
            record: "{that}.options.siteConfig.qssScaleFactor",
            target: "{app qssWrapper}.options.scaleFactor"
        },
        distributePspScaleFactor: {
            record: "{that}.options.siteConfig.pspScaleFactor",
            target: "{app psp}.options.scaleFactor"
        }
    }
});

/**
 * Get value for disabling the save button in QSS.
 * @param {String} saveSettingPath - The path for the "Save" button setting
 * @param {Boolean} shouldDisableSaveButton - Whether the save button should be disabled or not
 * @return {String[]} - In case it should be disabled, return the "Save" setting's path
 */
gpii.app.siteConfigurationHandler.getSaveDistribution = function (saveSettingPath, shouldDisableSaveButton) {
    return shouldDisableSaveButton ? [saveSettingPath] : [];
};
