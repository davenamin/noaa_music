/**
 * all of the logic to wire up our page with the JS code!
 */

// Initialize Flocking, CodeMirror, and hold onto a reference
// to the environment.
var environment = flock.init();


var codeEditor = CodeMirror.fromTextArea($('#editor')[0], {
    mode: {
        name: "javascript",
        json: true
    },
    autoCloseBrackets: true,
    matchBrackets: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    lineNumbers: true,
});

codeEditor.setValue('\
// "window.mllw_vals" contains an array of NOAA mean lower low water data! \n \
var synth = flock.synth({ \n \
    synthDef: \n \
    { \n \
    // http://flockingjs.org/demos/interactive/html/playground.html#freq_mod \n \
    ugen: "flock.ugen.sin", \n \
    freq: { \n \
        ugen: "flock.ugen.value", \n \
        rate: "audio", \n \
        value: 440, \n \
        mul: { \n \
            ugen: "flock.ugen.sin", \n \
            table: window.mllw_vals, \n \
            freq: 1 \n \
            } \n \
        } \n \
    } \n \
}); \n \
');


var load = function () {
    environment.stop();
    environment.reset();
    eval(codeEditor.getDoc().getValue());
}

var play = function () {
    environment.start();
};

var stop = function () {
    environment.stop();
};

loadData(environment);
load();