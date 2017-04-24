/**
 * encapsulate the logic to grab data from NOAA via CO-OPS
 * (https://tidesandcurrents.noaa.gov/api/)
 * and end up with a buffer of data to treat as audio!
 * 
 * Actually - now we're caching the data on the server.
 */

var wlLoader = function (callback) {
    return $.getJSON("/wl", {
        version: navigator.appVersion,
        language: navigator.language,
        platform: navigator.platform,
        useragent: navigator.userAgent
    }, callback);
}

var wtLoader = function (callback) {
    return $.getJSON("/wt", {
        version: navigator.appVersion,
        language: navigator.language,
        platform: navigator.platform,
        useragent: navigator.userAgent
    }, callback);
}


var atLoader = function (callback) {
    return $.getJSON("/at", {
        version: navigator.appVersion,
        language: navigator.language,
        platform: navigator.platform,
        useragent: navigator.userAgent
    }, callback);
}


var windLoader = function (callback) {
    return $.getJSON("/wind", {
        version: navigator.appVersion,
        language: navigator.language,
        platform: navigator.platform,
        useragent: navigator.userAgent
    }, callback);
}


var pressureLoader = function (callback) {
    return $.getJSON("/pressure", {
        version: navigator.appVersion,
        language: navigator.language,
        platform: navigator.platform,
        useragent: navigator.userAgent
    }, callback);
}


var conductivityLoader = function (callback) {
    return $.getJSON("/conductivity", {
        version: navigator.appVersion,
        language: navigator.language,
        platform: navigator.platform,
        useragent: navigator.userAgent
    }, callback);
}


/**
 * no longer using wavesurfer.js, so make our own HTML5 visualizer..
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
 */
var createAudioVisualizer = function (environment) {
    var context = environment.audioSystem.context;
    var analyser = context.createAnalyser();

    // this was a lot of fun to find. looks like this jams in the analyzer as a sink
    environment.audioSystem.nativeNodeManager.insertOutput(analyser);

    analyser.fftSize = 2048;
    var bufferLength = analyser.fftSize;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // draw an oscilloscope of the current audio source
    var canvas = $("canvas").get(0); // needed to get the actual element from jquery selector?
    var canvasCtx = canvas.getContext("2d");
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    function draw() {

        drawVisual = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(250, 250, 250)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    };

    draw();
    return analyser;
}

/**
 * Attempts at using Flocking for our audio generation (using latest master from 4/2/2017)
 * https://github.com/colinbdclark/Flocking/blob/master/docs/buffers/about-buffers.md#using-the-flockugenwritebuffer-unit-generator
 */
var createFlockingData = function () {
    var vals = new Array(window.wl_data.data.length);
    for (var ii = 0; ii < window.wl_data.data.length; ii++) {
        vals[ii] = window.wl_data.data[ii];
    }
    // probably can't handle NaNs very well, so let's call those -1s
    window.wl_vals = Float32Array.from(vals, function (val) {
        var retval = parseFloat(val.v); if (isNaN(retval)) { return -1; } else { return retval; }
    });

    var vals = new Array(window.wt_data.data.length);
    for (var ii = 0; ii < window.wt_data.data.length; ii++) {
        vals[ii] = window.wt_data.data[ii];
    }
    // probably can't handle NaNs very well, so let's call those -1s
    window.wt_vals = Float32Array.from(vals, function (val) {
        var retval = parseFloat(val.v); if (isNaN(retval)) { return -1; } else { return retval; }
    });

    var vals = new Array(window.at_data.data.length);
    for (var ii = 0; ii < window.at_data.data.length; ii++) {
        vals[ii] = window.at_data.data[ii];
    }
    // probably can't handle NaNs very well, so let's call those -1s
    window.at_vals = Float32Array.from(vals, function (val) {
        var retval = parseFloat(val.v); if (isNaN(retval)) { return -1; } else { return retval; }
    });

    var vals = new Array(window.wind_data.data.length);
    for (var ii = 0; ii < window.wind_data.data.length; ii++) {
        vals[ii] = window.wind_data.data[ii];
    }
    // probably can't handle NaNs very well, so let's call those -1s
    window.wind_vals = Float32Array.from(vals, function (val) {
        var retval = parseFloat(val.g); if (isNaN(retval)) { return -1; } else { return retval; }
    });

    var vals = new Array(window.pressure_data.data.length);
    for (var ii = 0; ii < window.pressure_data.data.length; ii++) {
        vals[ii] = window.pressure_data.data[ii];
    }
    // probably can't handle NaNs very well, so let's call those -1s
    window.pressure_vals = Float32Array.from(vals, function (val) {
        var retval = parseFloat(val.v); if (isNaN(retval)) { return -1; } else { return retval; }
    });

    var vals = new Array(window.conductivity_data.data.length);
    for (var ii = 0; ii < window.conductivity_data.data.length; ii++) {
        vals[ii] = window.conductivity_data.data[ii];
    }
    // probably can't handle NaNs very well, so let's call those -1s
    window.conductivity_vals = Float32Array.from(vals, function (val) {
        var retval = parseFloat(val.v); if (isNaN(retval)) { return -1; } else { return retval; }
    });
}

var createDataGraph = function () {
    width = 600;
    height = 300;
    padding = 30;

    // plot the actual data using d3 and SVG
    var svg = d3.select("#waveplot").append("svg")
        .attr("width", width).attr("height", height);

    var tfunc = function (d) { return Date.parse(d.t) };
    var vfunc = function (d) { return d.v };

    var xaxis = d3.scaleTime().domain(d3.extent(window.wl_data.data, tfunc)).nice()
        .range([0, width]);
    var xmap = function (d) { return xaxis(tfunc(d)); };
    svg.append("g").attr("class", "axis")
        .attr("transform", "translate(0," + padding + ")")
        .call(d3.axisTop(xaxis))
        .append("text").attr("class", "label");

    var yaxis = d3.scaleLinear()
        .domain([
            d3.min(window.wl_data.data, vfunc) - 1,
            d3.max(window.wl_data.data, vfunc) + 1
        ]).nice()
        .range([height, 0]);
    var ymap = function (d) { return yaxis(vfunc(d)); };
    svg.append("g").attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.axisLeft(yaxis))
        .append("text").attr("class", "label");

    svg.selectAll("circle").data(window.wl_data.data)
        .enter().append("circle").attr("cx", xmap)
        .attr("cy", ymap)
        .attr("r", 1);

}


var loadData = function (environment) {

    /** grab all of the data */
    $.when(wlLoader(function (calldata) { window.wl_data = calldata; }),
        wtLoader(function (calldata) { window.wt_data = calldata; }),
        atLoader(function (calldata) { window.at_data = calldata; }),
        windLoader(function (calldata) { window.wind_data = calldata; }),
        pressureLoader(function (calldata) { window.pressure_data = calldata; }),
        conductivityLoader(function (calldata) { window.conductivity_data = calldata; }),
    ).then(function () {
        createDataGraph();
        createFlockingData();
        createAudioVisualizer(environment);
    });

};
