/*
 * GPII Flow Manager Development Tests
 *
 * Copyright 2013 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013)
 * under grant agreement no. 289016.
 *
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

"use strict";

var fluid = require("universal"),
    kettle = fluid.registerNamespace("kettle"),
    gpii = fluid.registerNamespace("gpii");

require("gpii-windows/index.js");
require("../node_modules/universal/gpii/node_modules/testing");

gpii.loadTestingSupport();

require("./IntegrationTestDefs.js");
require("./SettingsBrokerTestDefs.js");
require("./RestartDialogTestDefs.js");
require("./DialogManagerTestDefs.js");
require("./SurveysTestDefs.js");

fluid.registerNamespace("gpii.tests.app");

gpii.tests.app.startSequence = [
    { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
        func: "{testEnvironment}.events.constructServer.fire"
    }, { // Before the actual tests commence, the PSP application must be fully functional. The `onPSPReady` event guarantees that.
        event: "{that gpii.app}.events.onPSPReady",
        listener: "fluid.identity"
    }
];

// A common end sequence for all test definitions. They all use a mocked version of the
// survey server which should be closed when each testcase holder finishes.
gpii.tests.app.endSequence = [
    { // Close the mock survey server gracefully
        func: "{that}.app.surveyManager.surveyServer.close"
    }, { // Wait for the mock survey server until it has closed itself completely
        event: "{that}.app.surveyManager.surveyServer.events.onServerClosed",
        listener: "fluid.identity"
    }
];

// This is a fork of kettle.test.testDefToCaseHolder which is written in a non-reusable style
// See: https://issues.fluidproject.org/browse/KETTLE-60
gpii.tests.app.testDefToCaseHolder = function (configurationName, testDefIn) {
    var testDef = fluid.copy(testDefIn);
    var sequence = testDef.sequence;
    delete testDef.sequence;
    delete testDef.config;
    // We eliminate this since we need to wait longer for the app to be started
    // as well as the server
    // sequence.unshift.apply(sequence, kettle.test.startServerSequence);
    sequence.unshift.apply(sequence, gpii.tests.app.startSequence);
    sequence.push.apply(sequence, gpii.tests.app.endSequence);
    testDef.modules = [{
        name: configurationName + " tests",
        tests: [{
            name: testDef.name,
            expect: testDef.expect,
            sequence: sequence
        }]
    }];
    return testDef;
};

// Also a fork from kettle
// See: https://issues.fluidproject.org/browse/KETTLE-60
gpii.tests.app.testDefToServerEnvironment = function (testDef) {
    var configurationName = testDef.configType || kettle.config.createDefaults(testDef.config);
    return {
        type: "kettle.test.serverEnvironment",
        options: {
            configurationName: configurationName,
            components: {
                tests: {
                    options: gpii.tests.app.testDefToCaseHolder(configurationName, testDef)
                }
            }
        }
    };
};

// Also a fork from kettle
// See: https://issues.fluidproject.org/browse/KETTLE-60
gpii.tests.app.bootstrapServer = function (testDefs, transformer) {
    return kettle.test.bootstrap(testDefs, fluid.makeArray(transformer).concat([gpii.tests.app.testDefToServerEnvironment]));
};

gpii.tests.app.bootstrapServer([
    fluid.copy(gpii.tests.app.testDefs),
    fluid.copy(gpii.tests.dev.testDefs),
    fluid.copy(gpii.tests.settingsBroker.testDefs),
    fluid.copy(gpii.tests.restartWarningController.testDefs),
    fluid.copy(gpii.tests.dialogManager.testDefs),
    fluid.copy(gpii.tests.surveys.testDefs)
]);
