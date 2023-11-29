//Importing Harmonized Sentinel-2 MSI: MultiSpectral Instrument
var S2Dataset =
ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");
//Import color palettes
var palettes = require('users/gena/packages:palettes');
var color = palettes.cmocean.Speed[7];

//Draws a rectangular polygon over Singapore and Johor area
var geometry =
ee.Geometry.Polygon(
[[[103.371, 1.532],
[103.371, 1.229],
[104.175, 1.229],
[104.175, 1.532]]],null, false);

//Declare geometry as aoi
var aoi = geometry;

// Masking out using the SCL class, 3 (Cloud shadow), 7-10
function cloudMask(image){
var scl = image.select('SCL');
var mask = scl.eq(3).or(scl.gte(7).and(scl.lte(10)));
return image.updateMask(mask.eq(0));
}

//Setting the start and end date of image collection
var startDate = '2022-01-01';
var endDate = '2022-12-31';

//Selecting the images based on the date, cloud mask, and

var image = S2Dataset.filterBounds(aoi)
.filterDate(startDate,endDate)
.map(cloudMask)
.median()
.clip(aoi);
//Display false color composite using RGB 8-11-4
Map.addLayer(image, {bands:['B8', 'B11', 'B4'], min:0,
max:[5000,3000,2000]}, 'False color');

// Masking out using the SCL class, 3 (Cloud shadow), 7-10 (Clouds)
var MVI = image.expression('(NIR-Green)/(SWIR-Green)',{
'NIR':image.select('B8'),
'Green':image.select('B3'),
'SWIR':image.select('B11')}).rename('MVI');
//Display MVI
// Map.addLayer(MVI, {min:0, max:12, palette: color}, ‘MVIStretch’);
//Display mangrove extent map based on threshold
var MVI_extent = MVI.gte(10^200).selfMask();    // MVI default value is 4.5 ==> i changed it to higher number to see the data better
Map.addLayer(MVI_extent, { palette: 'green' }, "Mangrove Extent");  // og script is 'Mangrove Extent' instead of "Mangrove ...", ran it and it gave errors, so i changed it to "" instead. 

// Area pixel in hectares
var area_ha = ee.Image.pixelArea().divide(10000);

var area_mangrove =
ee.Number(MVI_extent.multiply(area_ha).rename('area').reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 10,
  bestEffort: true
}).get('area'));
print(ee.String('Mangroves area (ha) inside AOI:').cat(area_mangrove)); 

// Add vector data from Global Mangrove Watch for 2020

var extent_2020 = ee.FeatureCollection("projects/earthengine-legacy/assets/projects/sat-io/open-datasets/GMW/extent/gmw_v3_2020_vec");

Map.addLayer(extent_2020, {palette:'black'},'GMW Extent');



// link:
// https://code.earthengine.google.com/774456588694da514dde5743017f6031?accept_repo=users%2Fcrispliming%2FGEE101_students
