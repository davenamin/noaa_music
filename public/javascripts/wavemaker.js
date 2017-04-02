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
 * Attempts at using Flocking for our audio generation (using latest master from 4/2/2017)
 * https://github.com/colinbdclark/Flocking/blob/master/docs/buffers/about-buffers.md#using-the-flockugenwritebuffer-unit-generator
 */
var createFlockingData = function (context, wavesurfer, jsondata) {
    var vals = new Array(jsondata.data.length);
    for (var ii = 0; ii < jsondata.data.length; ii++) {
        vals[ii] = jsondata.data[ii];
    }
    // Initialize Flocking and hold onto a reference
    // to the environment.
    var environment = flock.init();

    // Record a 10 second, 4-channel audio file.
    var synth = flock.synth({
        synthDef: {
            ugen: "flock.ugen.writeBuffer",
            options: {
                duration: 30,
                numOutputs: 4
            },
            buffer: "recording",
            sources: [
                {
                    ugen: "flock.ugen.sin"
                },
                {
                    ugen: "flock.ugen.square"
                },
                {
                    ugen: "flock.ugen.tri"
                },
                {
                    ugen: "flock.ugen.saw"
                }
            ]
        }
    });

    environment.start();
    environment.asyncScheduler.once(10, function () {
        environment.stop();
        wavesurfer.loadDecodedBuffer(flock.bufferDesc.toAudioBuffer(context, environment.buffers["recording"]));
        // environment.saveBuffer({
        //     type: "wav",
        //     format: "float32",
        //     buffer: "recording",
        //     path: "my-recording.wav"
        // });
    });
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

var loadData = function (wavesurfer) {
    width = 600;
    height = 300;
    padding = 30;

    callbk = function (responsejson) {
        //wavesurfer.load('http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3');
        var context = new AudioContext();
        //wavesurfer.loadDecodedBuffer(createAudioBuffer(context, responsejson));
        createFlockingData(context, wavesurfer, responsejson);

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
