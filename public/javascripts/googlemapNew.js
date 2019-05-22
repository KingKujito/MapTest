//https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2

//The zoom level at which a heatmap switches to markers
var zoomLevelHeatmapMarkers = 9; //8

//Whether to use clusters or a heatmap
window.useCluster = false;

//Various styles for the cluster view.
var clusterStyles = [
  {
    textColor: 'white',
    url: 'http://localhost:9000/assets/images/m/m1.png',
    height: 48,
    width: 48
  }, {
      textColor: 'white',
      url: 'http://localhost:9000/assets/images/m/m2.png',
      height: 48,
      width: 48
    }, {
       textColor: 'white',
       url: 'http://localhost:9000/assets/images/m/m3.png',
       height: 48,
       width: 48
     }, {
         textColor: 'white',
         url: 'http://localhost:9000/assets/images/m/m4.png',
         height: 48,
         width: 48
       }, {
           textColor: 'white',
           url: 'http://localhost:9000/assets/images/m/m5.png',
           height: 48,
           width: 48
         }
];

//The style/options of our map cluster
var mcOptions = {
    gridSize: 50,
    styles: clusterStyles,
    maxZoom: 15
};


// Initialize and add the map
function initMap() {
  // The map, centered at a point provided by the backend
  window.map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: lastZoom,
        center: {lat: lastLat, lng: lastLon},
        //Prevent users from being able to scroll into an infinite abyss of nothingness on the Y-axis.
        restriction: {
                    latLngBounds: {
                        north: 85,
                        south: -85,
                        east: 180,
                        west: -180
                    },
                    strictBounds: true
                  }
      });

  //Create an infowindow for the markers
  window.infowindow = new google.maps.InfoWindow({
    content: 'content loading...'
  });

  //As soon as the map stops zooming/scrolling
  google.maps.event.addListener(map, 'idle', function() {
      insertParam(
          `[{"key": "zoom", "val": "${map.getZoom()}"}, { "key": "lat", "val": ${map.getCenter().lat()} }, { "key": "lng", "val": ${map.getCenter().lng()} }]`);
      //Make a request and update the map with relevant data.
      if(useCluster) {
        requestHandler();
      } else {
        updateMap();
      }
  });


  //Allow for real-time updating of map information based on an address.
  //Ajax calls > WebSockets, because we want to minimize the amount of requests whenever possible (Ajax does not
  //negatively affect user experience, nor does WebSockets enrich it in this case).
  document.getElementById('geocoder').addEventListener('click', function() {
      //Get coordinates of the address.
      var address = getAddress();
      $.get("/api/coordinates/js-array?q="+encodeURIComponent(address), function(res) {
        var j = JSON.parse(res);
        //Update the url to allow for sharing/storing queries/results.
        map.setZoom(8);
        insertParam(
        `[{"key": "zoom", "val": "${map.getZoom()}"}, {"key": "address", "val": "${address}"}]`);
        //Center our map around the address.
        window.map.setCenter({lat: j.lat, lng: j.lng});
        //Update the map
        updateMap();
      });
    });


}


//Google geocoder. Not used atm.
function geocodeAddress(geocoder, resultsMap, marker) {
  geocoder.geocode({'address': getAddress()}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      marker.setPosition({
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

//Update all markers
function updatePoints (points) {
    var d = JSON.parse(points);

    clearMarkers();

    //Create markers.
    window.markers = d.map(x =>
        new google.maps.Marker({
           position: {lat: x.lat, lng: x.lng},
           map: map,
           icon: {
                url: x.icon,
                scaledSize: new google.maps.Size(23, 32)},
           title: x.title
           }));

    //Add infowindow functionalities to each marker.
    window.markers.forEach(function(marker) {
        addInfoWindow(marker, '<span class="info-window">'+marker.getTitle()+'</span>');
    });

    //Make a marker cluster if desired
    if(window.useCluster) {
        if (window.markerCluster == null) {
            window.markerCluster = new MarkerClusterer(map, window.markers, mcOptions);
        } else {
            window.markerCluster.addMarkers(window.markers);
        }
    }
}

//remove all markers from the map
function clearMarkers() {
    //Delete the old cluster if any are present.
    if (window.markerCluster != null) {
        markerCluster.clearMarkers()
    }

    //Delete all old markers if any are present.
    if(window.markers != null) {
        window.markers.forEach(function(marker) {
            marker.setMap(null);
          });
    }
}

//Used to retrieve values from the url. Example: for "example.com?q=yes",  getUrlVars()["q"] == "yes"
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

//Update the url to include query parameters.
function insertParam(keyvalueJSON) {
        var q     = '';
        var query = JSON.parse(keyvalueJSON).map(kv =>  q += encodeURIComponent(kv.key) + "=" + encodeURIComponent(kv.val) + "&");
        var pos = 'lat=' + encodeURIComponent(map.getCenter().lat()) +
        '&lon=' + encodeURIComponent(map.getCenter().lng()) +
        '&zoom=' + encodeURIComponent(map.getZoom());

        history.pushState(null, '', '/googlemap?'+q+pos);
    }

//Center the map around the user's current IP position.
function CenterMyPosition() {
    $.getJSON('http://ipinfo.io/json?token=63884450bf0425', function(data){
        var location = data.loc.split(",");
        window.map.setCenter({lat: parseFloat(location[0]), lng: parseFloat(location[1])});
        updateMap();
    });
}

//Retrieve the address for facilities returned by a query
function getAddress() {
    return document.getElementById('address').value != null ? document.getElementById('address').value : getUrlVars()["address"];
}

//Assign infowindow functionality to a marker
function addInfoWindow(marker, content) {
    marker.addListener('mouseover', function() {
      window.infowindow.setContent(content);
      window.infowindow.open(map, marker);
    });
    marker.addListener('click', function() {
          openModal(marker.getTitle());
        });
}


//open the modal
function openModal(text) {
    document.getElementById('my-modal').style.display='block';
    document.getElementById('my-modal-facility').innerHTML = text;
}


//Create a heatmap
function createHeatmap(points) {

    if(window.heatmap != null) {
        window.heatmap.setMap(null);
    }

    window.heatmap = new google.maps.visualization.HeatmapLayer({
      data: points,
      map: map,
      gradient: [
                          'rgba(0, 0, 0, 0)',
                          'rgba(200, 255, 200, 0.6)',
                          'rgba(10, 170, 100, 0.2)',
                          'rgba(10, 170, 100, 0.2)',
                          'rgba(10, 170, 100, 0.2)'
                        ]
    });
}

//Clear the graphics of the heatmap.
function clearHeatmap() {
    if(window.heatmap != null) {
            window.heatmap.setMap(null);
        }
}

//turn the heatmap on/off
function toggleHeatmap() {
    window.useCluster = !window.useCluster;
    updateMap();
}

//This function makes sure requests are only made when necessary.
//If you zoom or scroll within the bounds of a previous request, no new data should be loaded.
function requestHandler() {
    //lZoom = last zoom state
    if(window.lZoom == null) {
        window.lZoom  = map.getZoom();
    }

    var n = map.getBounds().getNorthEast().lat();
    var s = map.getBounds().getSouthWest().lat();
    var e = map.getBounds().getNorthEast().lng();
    var w = map.getBounds().getSouthWest().lng();
    var z = map.getZoom();

    var nb = n > window.lastNorth;
    var sb = s < window.lastSouth;
    var eb = e > window.lastEast;
    var wb = w < window.lastWest;
    var zb = window.lZoom <= 3 && z > 3;

    //Update the map only when a section of the viewport is seen, which has no facility info loaded yet
    if(
      ((window.lastNorth == null || window.lastSouth == null || window.lastEast == null || window.lastWest == null) ||
       (nb || sb || eb || wb || zb))) {
        saveBounds();
        updateMap();
    }
    window.lZoom  = map.getZoom();
}

//save last bounds of the viewport
function saveBounds() {
  window.lastNorth = map.getBounds().getNorthEast().lat();
  window.lastSouth = map.getBounds().getSouthWest().lat();
  window.lastEast  = map.getBounds().getNorthEast().lng();
  window.lastWest  = map.getBounds().getSouthWest().lng();
}


//Updates the heatmap/markers based on viewport
function updateMap() {
    var n = map.getBounds().getNorthEast().lat();
    var s = map.getBounds().getSouthWest().lat();
    var e = map.getBounds().getNorthEast().lng();
    var w = map.getBounds().getSouthWest().lng();

    if(map.getZoom() > 3) {
        $.get("/api/facilities/js-array/box?n="+
            n
            +"&s="+
            s
            +"&e="+
            east(e,w)
            +"&w="+
            west(e,w)
            +"&low="+
            document.getElementById("time-low").value
            +"&high="+
            document.getElementById("time-high").value
            +"&limit=50000", function(result) {
          if (map.getZoom() < zoomLevelHeatmapMarkers && !useCluster) {
            clearMarkers();
            createHeatmap(JSON.parse(result).map(x => new google.maps.LatLng(x.lat, x.lng)));
          } else {
            clearHeatmap();
            updatePoints(result);
          }
        });
    } else {
        clearHeatmap();
        clearMarkers();
    }
}



//Trying to salvage what I can
//TODO fix these functions, make sure they work
function east(e, w) {
    if(e < w && w > 0) {
        return e + 360;
    } else {
        return e;
    }
}

function west(e, w) {
    if(w > e && e < 0) {
        return w + -360;
    } else {
        return w;
    }
}