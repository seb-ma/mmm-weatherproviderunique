/**
 * This MagicMirror² module is a proxy weather provider.
 * It permits to declare only one real weather provider that is periodically fetched and used by all weather modules. 
 * @module mmm-weatherproviderunique
 * @class WeatherProvider
 * @see `README.md`
 * @author Sébastien Mazzon
 * @license MIT - @see `LICENCE.txt`
 */
"use strict";

WeatherProvider.register("../../../mmm-weatherproviderunique/proxyweatherprovider", { // Trick with "../../../" needed to load provider outside of "default/providers" 

	/**
	 * Default properties of the module
	 * @see `module.defaults`
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html#defaults>
	 * @see `README.md`
	 */
	defaults: {
		weatherEndpoint: "mmm-weatherproviderunique",	// Name of module used as provider
		weatherEndpointId: undefined,					// If multiple identical weatherEndpoint are defined, discriminate it on the config attribute
	},

	/**
	 * Provider name
	 */
	providerName: "ProxyWeatherProvider",

	/**
	 * Instance of the real weather provider.
	 */
	weatherProvider: undefined,

	/**
	 * Search/Get the weather provider declared as module in main config
	 * Unlike standard provider, the module must be declared in main config and is searched with name set in `this.config.weatherEndpoint`
	 * @returns Module instance of weather provider
	 */
	retrieveWeatherProvider: function () {
		if (this.weatherProvider === undefined) {
			// Find module with name in config.weatherProvider
			// This module will be the real weather provider (must be a weather object)
			const moduleWeatherProviders = MM.getModules().filter(module => (module.name === this.config.weatherEndpoint));
			let moduleWeatherProvider = undefined;
			if (moduleWeatherProviders.length == 1) {
				// Only one module found - simple case
				moduleWeatherProvider = moduleWeatherProviders[0];
			} else if (moduleWeatherProviders.length > 1 && weatherEndpointId !== undefined) {
				// More than one module found - narrow with the weatherEndpointId
				moduleWeatherProvider = moduleWeatherProviders.find(module => (module.config.weatherEndpointId === this.config.weatherEndpointId))
			}
			if (moduleWeatherProvider !== undefined) {
				// Get the real weather provider
				this.weatherProvider = moduleWeatherProvider.weatherProvider;
			} else {
				Log.error(`Invalid module provider: ${this.config.weatherEndpoint}. Not found in modules`);
			}
		}
		return this.weatherProvider;
	},

	/**
	 * @see `weatherprovider.fetchCurrentWeather`
	 * @see <https://docs.magicmirror.builders/development/weather-provider.html#fetchcurrentweather>
	 */
	fetchCurrentWeather: function () {
		this.setCurrentWeather(this.retrieveWeatherProvider().currentWeather());
		this.updateAvailable();
	},

	/**
	 * @see `weatherprovider.fetchWeatherForecast`
	 * @see <https://docs.magicmirror.builders/development/weather-provider.html#fetchweatherforecast>
	 */
	fetchWeatherForecast: function () {
		this.setWeatherForecast(this.retrieveWeatherProvider().weatherForecast());
		this.updateAvailable();
	},

	/**
	 * @see `weatherprovider.fetchWeatherHourly`
	 * @see <https://docs.magicmirror.builders/development/weather-provider.html#fetchweatherhourly>
	 */
	fetchWeatherHourly: function () {
		this.setWeatherHourly(this.retrieveWeatherProvider().weatherHourly());
		this.updateAvailable();
	},

	fetchCurrentPollution: function () {
		this.setCurrentPollution(this.retrieveWeatherProvider().currentPollution());
		this.updateAvailable();
	},

	fetchPollutionForecast: function () {
		this.setPollutionForecast(this.retrieveWeatherProvider().pollutionForecast());
		this.updateAvailable();
	},

});
