/// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [37.09, -95.71],
  zoom: 4,
  layers: [basemap]
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 0.8,
      fillColor: getColor(feature.geometry.coordinates[2]), // depth is the 3rd coordinate
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "#ea2c2c" :  //red
           depth > 70 ? "#ea822c" :  //orange-red
           depth > 50 ? "#ee9c00" :  //orange
           depth > 30 ? "#eecc00" :  //yellow-orange
           depth > 10 ? "#d4ee00" :  //yellow-green
                        "#98ee00";   //green
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
   L.geoJson(data, {
    
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },

    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<strong>Location:</strong> ${feature.properties.place}<br>` +
        `<strong>Magnitude:</strong> ${feature.properties.mag}<br>` +
        `<strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    }

  // Add the data to  the map.
  }).addTo(map);
  
  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend"); 

    // Initialize depth intervals and colors for the legend
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#98ee00","#d4ee00","#eecc00","#ee9c00","#ea822c","#ea2c2c"];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background:${colors[i]}"></i> ` + 
        depths[i] + (depths[i + 1] ? `–${depths[i + 1]}<br>` : "+");
      }
  
    return div;
  };
  
  // Add the legend to the map.
  legend.addTo(map);
  
});