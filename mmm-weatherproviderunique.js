/**
 * This MagicMirror² module is a proxy weather provider.
 * It permits to declare only one real weather provider that is periodically fetched and used by all weather modules. 
 * @module mmm-weatherproviderunique
 * @class Module
 * @see `README.md`
 * @author Sébastien Mazzon
 * @license MIT - @see `LICENCE.txt`
 */
"use strict";

Module.register("mmm-weatherproviderunique", {

	/**
	 * Default properties of the module
	 * @see `module.defaults`
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html#defaults>
	 * @see `README.md`
	 */
	defaults: {
		initialLoadDelay: 0,								// 0 seconds delay
		updateIntervalCurrentWeather: 2 * 60 * 1000,		// every  2 minutes - set to null to not retrieve current weather
		updateIntervalCurrentPollution: 8 * 60 * 60 * 1000,	// every  8 minutes - set to null to not retrieve current pollution, hack on OpenWeatherMap provider to fetch current pollution
		updateIntervalForecastWeather: 15 * 60 * 1000,		// every 15 minutes - set to null to not retrieve forecast weather - not used with hack on OpenWeatherMap: fetchWeatherAll
		updateIntervalForecastPollution: 30 * 60 * 1000,	// every 30 minutes - set to null to not retrieve forecast pollution, hack on OpenWeatherMap provider to fetch pollution forecast

		weatherProvider: "openweathermap",	// Real weather provider
		weatherEndpoint: "/onecall",		// Endpoint for the real weather provider
		type: "full", // current, forecast, daily (equivalent to forecast), hourly (only with OpenWeatherMap /onecall endpoint), full: hack on OpenWeatherMap for current+hourly+daily
		expandDaySections: true, // hack on OpenWeatherMap provider to split in 4 entries the 4 data of a day

		units: config.units,
		tempUnits: config.units,
		windUnits: config.units,
		lang: config.language,
		useKmh: true,
	},

	/**
	 * Instance of the real weather provider.
	 */
	weatherProvider: null,

	/**
	 * Returns the scripts necessary for the weather module
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html#getscripts>
	 * @returns {string[]} An array with filenames
	 */
	 getScripts: function () {
		const pathWeather = "modules/default/weather/";
		return [
			//`${pathWeather}weatherprovider.js`, `${pathWeather}weatherobject.js`, // Already defined in weather module
			`${pathWeather}providers/${this.config.weatherProvider.toLowerCase()}.js`,
		];
	},

	/**
	 * Starts the weather module
	 * @see `module.start`
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html#start>
	 */
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

	/**
	 * Called when the real provider has retrieved data
	 */
	updateAvailable: function () {
		// Nothing to do here - data is directly stored by proxyweatherprovider
		Log.log("New weather information available.");
	},

	/**
	 * Schedules next data retrieving
	 * @param {string} type type of data to schedule ("current", "forecast", "currentPollution", "forecastPollution")
	 * @param {integer} initialDelay initial delay before updating - use interval if null
	 * @param {integer} interval delay before updating if initialDelay parameter is null
	 */
	scheduleUpdate: function (type, initialDelay = null, interval) {
		if (isNaN(interval) || interval === null || interval === 0) {
			return;
		}

		let nextLoad = interval;
		if (initialDelay !== null && initialDelay >= 0) {
			nextLoad = initialDelay;
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
