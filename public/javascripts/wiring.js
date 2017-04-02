/**
 * all of the logic to wire up our page with the JS code!
 */

var wavesurfer = WaveSurfer.create({
    container: '#waveblock', 
    scrollParent: true});


var play = function() {
    wavesurfer.play();
};

var pause = function() {
    wavesurfer.pause();
};

var stop = function() {
    wavesurfer.stop();
};

loadData(wavesurfer);