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

	defaults: {
		weatherEndpoint: "mmm-weatherproviderunique", // Name of module used as provider
		weatherEndpointId: undefined, // If multiple identical weatherEndpoint are defined, discriminate it on the config attribute
	},

	retrieveWeatherProvider() {
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

	fetchCurrentWeather() {
		this.setCurrentWeather(this.retrieveWeatherProvider().currentWeather());
		this.updateAvailable();
	},

	fetchWeatherForecast() {
		this.setWeatherForecast(this.retrieveWeatherProvider().weatherForecast());
		this.updateAvailable();
	},

	fetchWeatherHourly() {
		this.setWeatherHourly(this.retrieveWeatherProvider().weatherHourly());
		this.updateAvailable();
	},

	fetchCurrentPollution() {
		this.setCurrentPollution(this.retrieveWeatherProvider().currentPollution());
		this.updateAvailable();
	},

	fetchPollutionForecast() {
		this.setPollutionForecast(this.retrieveWeatherProvider().pollutionForecast());
		this.updateAvailable();
	},
});