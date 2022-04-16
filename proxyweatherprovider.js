/* MagicMirror²
 * Module: Weather
 *
 * By Sébastien Mazzon
 * MIT Licensed.
 *
 * This class is a proxy weather provider: it does nothing except giving last data from a unique weather provider.
 * This provider gives the same interface as any weather provider and can be call by any module without additional call to real provider.
 */
WeatherProvider.register("../../../mmm-weatherproviderunique/proxyweatherprovider", {
	providerName: "ProxyWeatherProvider",
	weatherProvider: undefined,
	timeoutFetch: 10 * 1000, // Limit before killing Promise used by fetchXXX

	defaults: {
		weatherEndpoint: "mmm-weatherproviderunique", // Name of module used as provider
		weatherEndpointId: undefined, // If multiple identical weatherEndpoint are defined, discriminate it on the config attribute
	},

	retrieveWeatherProvider: function () {
		if (this.weatherProvider === undefined) {
			// Find module with name in config.weatherProvider
			// This module will be the real weather provider (must be a weather object)
			const moduleWeatherProviders = MM.getModules().filter(module => (module.name === this.config.weatherEndpoint));
			let moduleWeatherProvider = undefined;
			if (moduleWeatherProviders.length == 1) {
				moduleWeatherProvider = moduleWeatherProviders[0];
			} else if (moduleWeatherProviders.length > 1 && weatherEndpointId !== undefined) {
				moduleWeatherProvider = moduleWeatherProviders.find(module => (module.config.weatherEndpointId === this.config.weatherEndpointId))
			}
			if (moduleWeatherProvider !== undefined) {
				this.weatherProvider = moduleWeatherProvider.weatherProvider;
			} else {
				Log.error(`Invalid module provider: ${this.config.weatherEndpoint}. Not found in modules`);
			}
		}
		return this.weatherProvider;
	},

	fetchCurrentWeather: function () {
		this.setCurrentWeather(this.retrieveWeatherProvider().currentWeather());
		this.updateAvailable();
	},

	fetchWeatherForecast: function () {
		this.setWeatherForecast(this.retrieveWeatherProvider().weatherForecast());
		this.updateAvailable();
	},

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