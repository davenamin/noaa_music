/**
 * all of the logic to wire up our page with the JS code!
 */
// Initialize Flocking, CodeMirror, and hold onto a reference
// to the environment.
var environment = flock.init();


var codeEditor = CodeMirror.fromTextArea($('#editor')[0], {
    mode: {
        name: "javascript"
    },
    autoCloseBrackets: true,
    matchBrackets: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    lineNumbers: true
});

codeEditor.setValue(`
// "wl_vals" contains an array of NOAA mean lower low water data 
// "wt_vals" contains an array of water temperatures 
// "at_vals" contains an array of air temperatures 
// "wind_vals" contains an array of wind speeds 
// "pressure_vals" contains an array of barometric pressures 
// "conductivity_vals" contains an array of water conductivity values 
var synth = flock.synth({ 
    synthDef: 
    { 
    // http://flockingjs.org/demos/interactive/html/playground.html#freq_mod 
    ugen: "flock.ugen.sin", 
    freq: { 
        ugen: "flock.ugen.value", 
        rate: "audio", 
        value: 440, 
        mul: { 
            ugen: "flock.ugen.sin", 
            table: wl_vals, 
            freq: 1 
            } 
        } 
    } 
}); 
`);


var load = function () {
    environment.stop();
    environment.reset();
    $.globalEval(codeEditor.getDoc().getValue());
};

var play = function () {
    environment.start();
};

var stop = function () {
    environment.stop();
};

$.when( $.ready )
    .then(function() {return loadData(environment);})
    .done(function() {load();});
