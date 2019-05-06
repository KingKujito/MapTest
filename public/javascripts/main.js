function makeMap(lastLat, lastLong, lastZoom) {

//------------------------------- MY LOCATION ON MAP -------------------------------//
    var image2 = new ol.style.Circle({
                  radius: 7,
                  fill: new ol.style.Fill({color: 'rgb(80,100,255)'}),
                  stroke: new ol.style.Stroke({color: 'white', width: 2})
                });

    var styles2 = {
        'Point': new ol.style.Style({
          image: image2
        })
      };

  var styleFunction2 = function(feature) {
    return styles2[feature.getGeometry().getType()];
  };

  var vectorSource2 = new ol.source.Vector({
    features: (new ol.format.GeoJSON()).readFeatures(geojsonObject2)
  });

  var vectorLayer2 = new ol.layer.Vector({
    source: vectorSource2,
    style: styleFunction2
  });
  vectorLayer2.setZIndex(150)

//------------------------------- FACILITY LOCATIONS ON MAP -------------------------------//
      var image = new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({color: '#ffcc33'}),
                    stroke: new ol.style.Stroke({color: 'red', width: 1})
                  });

      var styles = {
        'Point': new ol.style.Style({
          image: image
        })
      };

      var styleFunction = function(feature) {
        return styles[feature.getGeometry().getType()];
      };

      var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
      });

      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
      });
      vectorLayer.setZIndex(200)



//------------------------------- OTHER -------------------------------//
      var styleJson = 'https://api.maptiler.com/maps/88cf7710-e3e1-4258-95e3-00c2ee74d846/style.json?key=n6q5rAyas7Ce6IJIhLsQ';
      var source = new ol.source.Vector({wrapX: true});
      var vectorStyle = new ol.style.Style({
                                   fill: new ol.style.Fill({
                                     color: 'rgba(255, 255, 255, 0.2)'
                                   }),
                                   stroke: new ol.style.Stroke({
                                     color: '#ffcc33',
                                     width: 2
                                   }),
                                   image: new ol.style.Circle({
                                     radius: 7,
                                     fill: new ol.style.Fill({
                                       color: '#a50034'
                                     })
                                   })
                                 });

      var vector = new ol.layer.Vector({
        source: source,
        style: vectorStyle
      });
        vector.setZIndex(100)

      var map = new ol.Map({
        layers: [vector, vectorLayer, vectorLayer2],
        target: 'map',
        view: new ol.View({
          center: ol.proj.transform([lastLat, lastLong], 'EPSG:4326', 'EPSG:3857'),
          zoom: lastZoom
        })
      });

        olms.apply(map, styleJson);

      var draw; // global so we can remove it later
      function addInteraction() {
          draw = new ol.interaction.Draw({
            source: source,
            type: 'Point'
          });
          map.addInteraction(draw);
      }

      addInteraction();
  }