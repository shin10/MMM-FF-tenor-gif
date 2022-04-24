/* Magic Mirror
 * Module: MMM-FF-tenor-gif
 *
 * By Michael Trenkler
 * ISC Licensed.
 */

const https = require("https");

const GifFetcher = function (nodeHelper, config) {
  var { moduleId, baseURL, searchParams, updateOnSuspension, updateInterval } =
    config;

  // public for filtering
  this.moduleId = moduleId;

  var gif = null;
  var hidden = false;
  var timerObj = null;
  var updateOnVisibilityChangeRequested = false;

  const startInterval = () => {
    stopInterval();

    updateOnVisibilityChangeRequested = false;

    if (updateInterval === null) return;
    timerObj = setTimeout(() => intervalCallback(), updateInterval);
  };

  const stopInterval = () => {
    if (!timerObj) return;
    if (timerObj) clearTimeout(timerObj);
    timerObj = null;
  };

  const intervalCallback = () => {
    stopInterval();
    if (!hidden && updateOnSuspension !== true) {
      this.getRandomGif();
    } else if (hidden && updateOnSuspension === null) {
      this.getRandomGif();
    } else {
      updateOnVisibilityChangeRequested = true;
    }
  };

  this.suspend = () => {
    hidden = true;
    if (!gif) return;
    if (updateOnVisibilityChangeRequested && updateOnSuspension === true) {
      this.getRandomGif();
    } else if (!timerObj && updateOnSuspension !== true) {
      startInterval();
    }
  };

  this.resume = () => {
    hidden = false;
    if (!gif) return;
    if (updateOnVisibilityChangeRequested && updateOnSuspension === false) {
      this.getRandomGif();
    } else if (!timerObj) {
      startInterval();
    }
  };

  const prepareNotificationConfig = () => {
    const copy = Object.assign({ gif: gif }, config);
    return copy;
  };

  const updateGif = (gifData) => {
    gif = gifData;
    nodeHelper.sendSocketNotification("UPDATE_GIF", {
      config: prepareNotificationConfig()
    });
    startInterval();
  };

  const parseData = (body) => {
    const gif = JSON.parse(body);
    return gif;
  };

  this.getRandomGif = () => {
    const myURL = new URL(baseURL);
    const params = JSON.parse(JSON.stringify(searchParams));
    if (Array.isArray(params.q)) {
      params.q = params.q[~~(Math.random() * params.q.length)];
    }
    const search = new URLSearchParams(params).toString();
    myURL.search = search;

    const request = https
      .get(myURL, (response) => {
        if (response.statusCode === 200) {
          let data = "";
          response
            .on("data", (body) => {
              data += body;
            })
            .on("end", () => {
              updateGif(parseData(data));
            })
            .on("error", (err) => {
              console.error(err);
              nodeHelper.sendSocketNotification("ERROR", err);
            });
        } else {
          nodeHelper.sendSocketNotification("ERROR", response);
        }
      })
      .on("error", (err) => {
        console.error(err);
        nodeHelper.sendSocketNotification("ERROR", err);
      });

    request.end();
  };
};

module.exports = GifFetcher;
