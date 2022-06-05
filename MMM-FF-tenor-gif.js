/* Magic Mirror
 * Module: MMM-FF-tenor-gif
 *
 * By Michael Trenkler
 * ISC Licensed.
 */

Module.register("MMM-FF-tenor-gif", {
  defaults: {
    baseURL: "https://g.tenor.com/v1/random",
    searchParams: {
      key: "$TENOR_API_KEY",
      q: "excited",
      contentfilter: "high",
      media_filter: "minimal",
      limit: 1
    },
    updateOnSuspension: null,
    updateInterval: 1 * 60 * 60 * 1000,
    imageMaxWidth: null,
    imageMaxHeight: null,
    animationSpeed: 1000,
    events: {
      GIF_RANDOM: "GIF_RANDOM"
    }
  },

  init: function () {
    this.error = null;
    this.gifData = null;
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.getRandomGif();
  },

  getScripts: function () {
    return [];
  },

  getStyles: function () {
    return [this.file("./styles/MMM-FF-tenor-gif.css")];
  },

  getHeader: function () {
    const title = [];
    if (this.data.header === false) return null;
    else if (this.data.header === undefined) title.push("Tenor");
    else if (this.data.header !== null) title.push(this.data.header);
    const gif = this.gifData?.results?.[0];
    if (gif?.content_description) title.push(gif.content_description);
    return title.join(" - ");
  },

  getDom: function () {
    var wrapper = document.createElement("div");

    if (this.error) {
      wrapper.innerHTML = "ERROR<br>" + JSON.stringify(this.error);
      wrapper.className = "light small error";
      return wrapper;
    }

    let loaded = this.gifData;
    if (!loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "light small dimmed";
      return wrapper;
    }

    var imgWrapper = document.createElement("div");
    imgWrapper.classList.add("gif-wrapper");

    var img = document.createElement("img");
    img.classList.add("gif");
    const gif = this.gifData.results[0];
    if (!gif) return wrapper;

    img.src = gif.media[0].gif.url;
    img.alt = gif.content_description;

    img.style.maxWidth = this.config.imageMaxWidth;
    img.style.maxHeight = this.config.imageMaxHeight;

    imgWrapper.appendChild(img);
    wrapper.appendChild(imgWrapper);

    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (!payload.config || payload.config.moduleId !== this.config.moduleId)
      return;

    switch (notification) {
      case "ERROR":
        this.error = payload;
        this.updateDom(this.config.animationSpeed);
        break;
      case "UPDATE_GIF":
        this.error = null;
        this.gifData = payload.config.gif;
        this.updateDom(this.config.animationSpeed);
        break;
      default:
        break;
    }
  },

  showLoader: function () {
    this.init();
    this.updateDom(this.config.animationSpeed);
  },

  getRandomGif: function () {
    this.sendSocketNotification("RANDOM_GIF", { config: this.config });
  },

  isAcceptableSender(sender) {
    if (!sender) return false;
    const acceptableSender = this.config.events.sender;
    return (
      !acceptableSender ||
      acceptableSender === sender.name ||
      acceptableSender === sender.identifier ||
      (Array.isArray(acceptableSender) &&
        (acceptableSender.includes(sender.name) ||
          acceptableSender.includes(sender.identifier)))
    );
  },

  notificationReceived: function (notification, payload, sender) {
    if (!this.isAcceptableSender(sender)) return;

    this.config.events[notification]?.split(" ").forEach((e) => {
      switch (e) {
        case "GIF_RANDOM":
          if (!this.hidden) {
            this.showLoader();
            this.getRandomGif();
          }
          break;
        default:
          break;
      }
    });
  },

  suspend: function () {
    this.suspended = true;
    this.sendSocketNotification("SUSPEND", { config: this.config });
  },

  resume: function () {
    if (this.suspended === false) return;
    this.suspended = false;
    this.sendSocketNotification("RESUME", { config: this.config });
  }
});
