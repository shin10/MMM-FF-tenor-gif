# MMM-FF-tenor-gif

[![ISC License](https://img.shields.io/badge/license-ISC-blue.svg)](https://choosealicense.com/licenses/isc)

A module for [MagicMirror²](https://github.com/MichMich/MagicMirror) that displays random animated gifs.

You'll need an API key, which you can get [here](https://tenor.com/developer/dashboard).

Features:

- supports multiple module instances
- supports multiple mirror instances, controlled by a single server

## Installation

Just navigate to the `modules` directory of your MagicMirror² installation and clone this repository.

```sh
git clone https://github.com/shin10/MMM-FF-tenor-gif.git
```

## Configuration

**Example:**

```js
{
  module: "MMM-FF-tenor-gif",
  position: "bottom",
  hiddenOnStartup: true,
  config:{
    header: "Tenor",
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
      GIF_RANDOM: "ARTICLE_RANDOM"
    }
  },
}
```

### Configuration Options

| **Option**           | **Type**         | **Default**                       | **Description**                                                                              |
| -------------------- | ---------------- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| `header`             | `string`         | `"Tenor"`                         | The header text.                                                                             |
| `baseURL`            | `string`         | `"https://g.tenor.com/v1/random"` | The API endpoint.                                                                            |
| `searchParams`       | `object`         | (See below)                       | URLSearchParam object, containing the API key, etc.                                          |
| `updateInterval`     | `int`            | `3600000` (1 hour)                | The duration of the update interval in ms or `null`.                                         |
| `updateOnSuspension` | `bool`           | `null`                            | When to update the image. `null`, `false` or `true`. Further explanations below.             |
| `imageMaxWidth`      | `string`         | `null`                            | Maximum _width_ of the comic strip in any valid _css unit_ like `px`, `%`, `vw`, `vmin` ...  |
| `imageMaxHeight`     | `string`         | `null`                            | Maximum _height_ of the comic strip in any valid _css unit_ like `px`, `%`, `vh`, `vmin` ... |
| `animationSpeed`     | `string`         | `1000`                            | The duration of the page transition.                                                         |
| `events`             | `object`         |                                   | A filter and list of _event constants_ to remap if necessary.                                |
| `events.sender`      | `string`/`array` | `undefined`                       | Filter events to those dispatched by given _module ids_.                                     |

#### searchParams

| **Option**      | **Type** | **Default** | **Description**                   |
| --------------- | -------- | ----------- | --------------------------------- |
| `key`           | `string` | `undefined` | **_Enter your API key here._**    |
| `q`             | `string` | `"excited"` | Search query                      |
| `locale`        | `string` | `undefined` | The default value is `en_US`.     |
| `contentfilter` | `string` | `"high"`    | `off` , `low`, `medium` or `high` |
| `media_filter`  | `string` | `"minimal"` | `basic` or `minimal`              |
| `ar_range`      | `string` | `undefined` | `all`, `wide` or `standard`       |
| `limit`         | `int`    | 1           | Maximum number of results.        |

See the [API documentation](https://tenor.com/gifapi/documentation#endpoints) for further information.

### `updateInterval` and `updateOnSuspension`

These two parameters work together. The `updateInterval` is used to set the **_minimal_** amount of time the displayed item has to exist, before it will be replaced by the next. When this actually will take place depends on the value of `updateOnSuspension`.

If `updateOnSuspension` is set to `true` the item will wait till the interval timer fired and the module goes to the background. If set to `false` the `updateInterval` has to elapse while the item is in background and will replace the item when the module is shown again.

If `updateOnSuspension` is set to `null` the content will be replaced whenever the timer is done; visible or not.

If `updateInterval` is set to `null` the item won't be updated by the module. Instead you'll have to dispatch one of the events listed above.

### Events

The following events are supported:

- GIF_RANDOM

For ease of use they can be remapped in the `events` object to custom strings. Refer to the example config above.

Events will be ignored if the module is currently hidden.
