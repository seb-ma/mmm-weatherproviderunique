/* global WeatherProvider */

/* MagicMirror²
 * Module: mmm-weatherproviderunique
 *
 * By Sébastien Mazzon
 * MIT Licensed.
 */
Module.register("mmm-weatherproviderunique", {
	// Default module config.
	defaults: {
		initialLoadDelay: 0, // 0 seconds delay
		updateIntervalCurrentWeather: 2 * 60 * 1000, // every 2 minutes - set to null to not retrieve current weather
		updateIntervalCurrentPollution: 8 * 60 * 60 * 1000, // every 8 minutes - set to null to not retrieve current pollution, hack on OpenWeatherMap provider to fetch current pollution
		updateIntervalForecastWeather: 15 * 60 * 1000, // every 15 minutes - set to null to not retrieve forecast weather - not used with hack on OpenWeatherMap: fetchWeatherAll
		updateIntervalForecastPollution: 30 * 60 * 1000, // every 30 minutes - set to null to not retrieve forecast pollution, hack on OpenWeatherMap provider to fetch pollution forecast

		weatherProvider: "openweathermap",
		weatherEndpoint: "/onecall",
		type: "full", // current, forecast, daily (equivalent to forecast), hourly (only with OpenWeatherMap /onecall endpoint), full: hack on OpenWeatherMap for current+hourly+daily
		expandDaySections: true, // hack on OpenWeatherMap provider to split in 4 entries the 4 data of a day

		units: config.units,
		tempUnits: config.units,
		windUnits: config.units,
		lang: config.language,
		useKmh: true,
	},

	// Module properties.
	weatherProvider: null,

	// Return the scripts that are necessary for the weather module.
	getScripts: function () {
		const pathWeather = "modules/default/weather/";
		return [
			//`${pathWeather}weatherprovider.js`, `${pathWeather}weatherobject.js`, // // Already defined in weather module
			`${pathWeather}providers/${this.config.weatherProvider.toLowerCase()}.js`,
		];
	},

	// Start the weather module.
	start: function () {
		// Initialize the weather provider.
		this.weatherProvider = WeatherProvider.initialize(this.config.weatherProvider, this);

		// Let the weather provider know we are starting.
		this.weatherProvider.start();

		// Schedule the first update.
		if (this.config.type === "full") {
			this.scheduleUpdate("current", this.config.initialLoadDelay, this.config.updateIntervalCurrentWeather);
			this.scheduleUpdate("forecast", this.config.initialLoadDelay, this.config.updateIntervalForecastWeather);
			this.scheduleUpdate("currentPollution", this.config.initialLoadDelay, this.config.updateIntervalCurrentPollution);
			this.scheduleUpdate("forecastPollution", this.config.initialLoadDelay, this.config.updateIntervalForecastPollution);
		} else {
			this.scheduleUpdate(this.config.type, this.config.type === "current" ? this.config.updateIntervalCurrentWeather : this.config.updateIntervalForecastWeather);
		}
	},

	// What to do when the weather provider has new information available?
	updateAvailable: function () {
		// Nothing to do here
		Log.log("New weather information available.");
	},

	scheduleUpdate: function (type, delay = null, interval) {
		if (isNaN(interval) || interval === null || interval === 0) {
			return;
		}

		let nextLoad = interval;
		if (delay !== null && delay >= 0) {
			nextLoad = delay;
		}
		setTimeout(() => {
			switch (type) {
				case "current":
					if (typeof this.weatherProvider.fetchWeatherAll === "function") {
						// Hack on openweathermap provider to fetch all data from onecall in… one call
						this.weatherProvider.fetchWeatherAll();
					} else {
						this.weatherProvider.fetchCurrentWeather();
					}
					break;
				case "currentPollution":
					if (typeof this.weatherProvider.fetchCurrentPollution === "function") {
						this.weatherProvider.fetchCurrentPollution();
					}
					break;
				case "hourly":
					this.weatherProvider.fetchWeatherHourly();
					break;
				case "daily":
				case "forecast":
					if (typeof this.weatherProvider.fetchWeatherAll === "function") {
						// If "current" interval is already set, don't fetch data (already retrieved)
						if (isNaN(this.config.updateIntervalCurrentWeather) || this.config.updateIntervalCurrentWeather === 0) {
							// Hack on openweathermap provider to fetch all data from onecall in… one call
							this.weatherProvider.fetchWeatherAll();
						}
					} else {
						this.weatherProvider.fetchWeatherHourly();
						this.weatherProvider.fetchWeatherForecast();
					}
					break;
				case "forecastPollution":
					if (typeof this.weatherProvider.fetchPollutionForecast === "function") {
						this.weatherProvider.fetchPollutionForecast();
					}
					break;
				default:
					Log.error(`Invalid type ${type} configured (must be one of 'current', 'hourly', 'daily', 'forecast', 'currentPollution', 'forecastPollution')`);
			}
			this.scheduleUpdate(type, null, interval);
		}, nextLoad);
	},
});
