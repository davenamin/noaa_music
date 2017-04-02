/**
 * all of the logic to wire up our page with the JS code!
 */

// Initialize Flocking and hold onto a reference
// to the environment.
var environment = flock.init();

var play = function () {
    environment.start();
};

var stop = function () {
    environment.stop();
};

loadData(environment);