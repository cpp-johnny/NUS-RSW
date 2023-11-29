var geometry = ee.Geometry.Point([23.7275, 37.9838])
Map.centerObject(geometry, 12)

// Importing Greece administrative boundaries

var worldcountries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var filterCountry = ee.Filter.eq('country_na', 'Italy');
var country = worldcountries.filter(filterCountry);
var collection = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
  .select('NO2_column_number_density')
  .filterDate('2019-06-01', '2020-06-06');

var band_viz = {
  min: 0,
  max: 0.0002,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};

Map.addLayer(collection.mean(), band_viz, 'S5P N02');
Map.setCenter(65.27, 24.11, 4);


Map.addLayer(country);
Map.centerObject(country, 6);
