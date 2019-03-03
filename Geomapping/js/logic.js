function chooseColor(magnitude)
      { 
          switch(parseInt( magnitude)){
              case 0: return '#b7f34d';
              case 1: return '#e1f34d';
              case 2: return '#f3db4d';
              case 3: return '#f3ba4d';
              case 4: return '#f0a76b';
              default: return '#f06b6b';
          }
      }
function markerSize(magnitude) {
  return magnitude * 2;
      }


//earthquake data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson" 

//faultline link
var tectonic_link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Defines two functions that are run once for each feature in earthquakeData
  // Creates markers for each earthquake and adds a popup describing the place, time, and magnitude of each
  function onEachQuakeLayer(feature, layer) {
    return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      fillOpacity: 1,
      color: chooseColor(feature.properties.mag),
      fillColor: chooseColor(feature.properties.mag),
      radius:  markerSize(feature.properties.mag)
    });
  }
  function onEachEarthquake(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachEarthquake,
    pointToLayer: onEachQuakeLayer
  });


 // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


console.log("gibberish")

var tectonicPlates = new L.LayerGroup();
d3.json(tectonic_link, function (plateData) {
  
  console.log(plateData)
  L.geoJSON(plateData,
    {
      color: 'red',
      weight: 2
    })
    .addTo(tectonicPlates);
});  


function createMap(earthquakes) {
  console.log(tectonicPlates)

    
  // Define streetmap and darkmap layers
  var streetmap =  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    
    accessToken: API_KEY
  });
	//courtesy of esri_worldImagery: http://leaflet-extras.github.io/leaflet-providers/preview/
	
	var darkish = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

  var lightMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: API_KEY
  });

  var satellite =  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
	
  

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Light Map": lightMap,
    "Satellite": satellite,
	"Dark Map": darkish
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [
      42.09, -72.71
    ],
    zoom: 2,
    layers: [darkish, earthquakes, tectonicPlates]
  });
	
//
	
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);



  CreateLegend();
    

function CreateLegend()
{
var legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var labels = ["0-1","1-2","2-3","3-4","4-5","5+"];  
  var legends = [];
  //div.innerHTML = legendInfo;

  for(var i=0;i<labels.length;i++) {
    legends.push("<li style=\"list-style-type:none;\"><div style=\"background-color: " + chooseColor(i) + "\">&nbsp;</div> "+
                                                     "<div>"+ labels[i]+"</div></li>");
  }

  div.innerHTML += "<ul class='legend'>" + legends.join("") + "</ul>";
  return div;
};

// Adding legend to the map
legend.addTo(myMap);
}

}

