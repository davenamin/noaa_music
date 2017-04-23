/**
 * encapsulate the logic to grab data from NOAA via CO-OPS
 * (https://tidesandcurrents.noaa.gov/api/)
 * and end up with a buffer of data to treat as audio!
 */

var coopsLoader = function (callback) {
    // url for CO-OPS data service..
    // coops_url = 'https://tidesandcurrents.noaa.gov/api/datagetter';

    // things we may or may not change
    parameters = {
        format: "json",
        time_zone: "lst_ldt", //local (daylight savings) time
        application: "newport-wav", // whatever we want to identify as
        station: "8452660", // the ID of the newport NOAA station
        datum: "MLLW", // relative to Mean Lower Low Water datum
        units: "english", // because AMERICA
        range: "72", // hours of data
        product: "water_level" // the type of data
    }
    return $.getJSON("/coops", parameters, callback);
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
var createFlockingData = function (environment, jsondata) {
    var vals = new Array(jsondata.data.length);
    for (var ii = 0; ii < jsondata.data.length; ii++) {
        vals[ii] = jsondata.data[ii];
    }
    // probably can't handle NaNs very well, so let's call those -1s
    window.mllw_vals = Float32Array.from(vals, function (val) {
        var retval = parseFloat(val.v); if (isNaN(retval)) { return -1; } else { return retval; }
    });

    window.console.log(vals);
    window.console.log(window.mllw_vals);
    }

/**
 * create a Uint8Array from a data payload
 */
var createAudioBuffer = function (context, jsondata) {
    var vals = new Array(jsondata.data.length);
    for (var ii = 0; ii < jsondata.data.length; ii++) {
        vals[ii] = jsondata.data[ii];
    }
    var betweenvals = 6;
    var sampleRate = 44100;
    var audioBuffer = context.createBuffer(1, vals.length * betweenvals, sampleRate); // new Uint8Array(vals.length * betweenvals);
    var retval = audioBuffer.getChannelData(0);
    // map the values to a byte buffer
    var mapper = d3.scaleLinear().domain(d3.extent(vals)).range([0, 255]);
    for (var ii = 0; ii < vals.length; ii++) {
        var interp = d3.interpolateNumber(vals[ii - 1], vals[ii]);
        for (var jj = 0; jj < betweenvals; jj++) {
            retval[ii + jj] = interp(jj / 6);
        }
    }
    return audioBuffer;
}

var loadData = function (environment) {
    width = 600;
    height = 300;
    padding = 30;

    callbk = function (responsejson) {
        createAudioVisualizer(environment);

        createFlockingData(environment, responsejson);

        // plot the actual data using d3 and SVG
        var svg = d3.select("#waveplot").append("svg")
            .attr("width", width).attr("height", height);

        var tfunc = function (d) { return Date.parse(d.t) };
        var vfunc = function (d) { return d.v };

        var xaxis = d3.scaleTime().domain(d3.extent(responsejson.data, tfunc)).nice()
            .range([0, width]);
        var xmap = function (d) { return xaxis(tfunc(d)); };
        svg.append("g").attr("class", "axis")
            .attr("transform", "translate(0," + padding + ")")
            .call(d3.axisTop(xaxis))
            .append("text").attr("class", "label");

        var yaxis = d3.scaleLinear()
            .domain([
                d3.min(responsejson.data, vfunc) - 1,
                d3.max(responsejson.data, vfunc) + 1
            ]).nice()
            .range([height, 0]);
        var ymap = function (d) { return yaxis(vfunc(d)); };
        svg.append("g").attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(d3.axisLeft(yaxis))
            .append("text").attr("class", "label");

        svg.selectAll("circle").data(responsejson.data)
            .enter().append("circle").attr("cx", xmap)
            .attr("cy", ymap)
            .attr("r", 1);
    }
    coopsLoader(callbk);
};
