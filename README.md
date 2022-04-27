# mmm-weatherproviderunique

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module is useful when using multiple weather modules. It permits to declare only one real weather provider that is periodically fetched.
All weather modules retrieve its data instead of having 1 provider called for each module weather (helps to have a very little interval fetching for all weather modules).

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file
and configure `weatherProvider` and `weatherEndpoint` on weather modules:

```js
var config = {
	modules: [
		// Typical configuration of weather module
		{
			module: "weather",
			config: {
				weatherProvider: "../../../mmm-weatherproviderunique/proxyweatherprovider", // pseudo-relative path needed to be correctly handled by weatherprovider
				weatherEndpoint: "mmm-weatherproviderunique",
				//weatherEndpointId: "provider-1", // only needed if more than 1 mmm-weatherproviderunique is defined
			}
		},

		// Module configuration
		{
			module: "mmm-weatherproviderunique",
			config: {
				initialLoadDelay: 0, // 0 seconds delay
				updateIntervalCurrentWeather: 2 * 60 * 1000, // every 2 minutes - set to null to not retrieve current weather
				updateIntervalCurrentPollution: 8 * 60 * 60 * 1000, // every 8 minutes - set to null to not retrieve current pollution, hack on OpenWeatherMap provider to fetch current pollution
				updateIntervalForecastWeather: 15 * 60 * 1000, // every 15 minutes - set to null to not retrieve forecast weather - not used with hack on OpenWeatherMap: fetchWeatherAll
				updateIntervalForecastPollution: 30 * 60 * 1000, // every 30 minutes - set to null to not retrieve forecast pollution, hack on OpenWeatherMap provider to fetch pollution forecast

				weatherProvider: "openweathermap",
				weatherEndpoint: "/onecall",
				type: "full", // current, forecast, daily (equivalent to forecast), hourly (only with OpenWeatherMap /onecall endpoint), full for current+hourly+daily
				expandDaySections: true, // hack on OpenWeatherMap provider to split in 4 entries the 4 data of a day

				units: config.units,
				tempUnits: config.units,
				windUnits: config.units,
				lang: config.language,
				useKmh: true,
			}
		},
	]
}
```

## Installation

```sh
cd ~/MagicMirror/modules # Change path to modules directory of to your actual MagiMirror² installation
git clone https://github.com/seb-ma/mmm-weatherproviderunique
cd mmm-weatherproviderunique
npm install --only=production
```

## Configuration options

| Option							| Description
|---------------------------------- |-------------
| `initialLoadDelay`				| *Optional* The initial delay before loading. If you have multiple modules that use the same API key, you might want to delay one of the requests. (Milliseconds) <br><br>**Type:** `int`(milliseconds) <br>Default 0 milliseconds
| `updateIntervalCurrentWeather`	| *Optional* How often does the content of current weather needs to be fetched? (Milliseconds)<br><br>**Type:** `int`(milliseconds) <br>Default 2 minutes
| `updateIntervalCurrentPollution`	| *Optional* How often does the content of current pollution needs to be fetched? (Milliseconds)<br>Only applicable if `fetchCurrentPollution` is available (hack to be applied)<br><br>**Type:** `int`(milliseconds) <br>Default 8 minutes
| `updateIntervalForecastWeather`	| *Optional* How often does the content of forecast weather needs to be fetched? (Milliseconds)<br>Not used if hack is applied to have `fetchWeatherAll` (this way: current and forecast are retried at the same time)<br><br>**Type:** `int`(milliseconds) <br>Default 15 minutes
| `updateIntervalForecastPollution`	| *Optional* How often does the content of forecast pollution needs to be fetched? (Milliseconds)<br>Only applicable if `fetchPollutionForecast` is available (hack to be applied)<br><br>**Type:** `int`(milliseconds) <br>Default 30 minutes
| *all configurations of providers*	| *see https://docs.magicmirror.builders/modules/weather.html#configuration-options*

### Nota

To work, this module needs to be spelled in lower case (thus, the weather provider can be called by MagicMirror² `weatherprovider`).
