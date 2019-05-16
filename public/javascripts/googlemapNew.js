//https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2

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


  google.maps.event.addListener(map, 'idle', function() {
      insertParam(
          `[{"key": "zoom", "val": "${map.getZoom()}"}, { "key": "lat", "val": ${map.getCenter().lat()} }, { "key": "lng", "val": ${map.getCenter().lng()} }]`);
      updateMap();
  });


  //Allow for real-time updating of map information based on an address.
  //Ajax calls > WebSockets, because we want to minimize the amount of requests whenever possible (Ajax does not
  //negatively affect user experience, nor does WebSockets enrich it in this case).
  document.getElementById('geocoder').addEventListener('click', function() {
      //Get coordinates of the address.
      var address = getAddress();
      $.get("/api/coordinates/js-array?q="+encodeURIComponent(address), function(res) {
        var j = JSON.parse(res);
        var radius = document.getElementById('georadius').value;
        //Update the url to allow for sharing/storing queries/results.
        insertParam(
        `[{"key": "address", "val": "${address}"}, { "key": "radius", "val": ${radius} }]`);
        //Center our map around the address.
        window.map.setCenter({lat: j.lat, lng: j.lng});
        //Get facilities near the address.
        getPointsAPICall(j.lat, j.lng, radius, getLimit());
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

    //Delete all old markers if any are present.
    if (window.markers != null) {
        window.markers.forEach(function(marker) {
          marker.setMap(null);
        });
    }

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
}

function clearMarkers() {
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
        var location = data.loc.split(",")
        window.map.setCenter({lat: parseFloat(location[0]), lng: parseFloat(location[1])});
    });
}

//Retrieve the address for facilities returned by a query
function getAddress() {
    return document.getElementById('address').value != null ? document.getElementById('address').value : getUrlVars()["address"];
}

//Assign infowindow functionality to a marker
function addInfoWindow(marker, content) {
    marker.addListener('click', function() {
      window.infowindow.setContent(content);
      window.infowindow.open(map, marker);
    });
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

function clearHeatmap() {
    if(window.heatmap != null) {
            window.heatmap.setMap(null);
        }
}

function toggleHeatmap() {
    if (window.heatmap != null) {
        window.heatmap.setMap(heatmap.getMap() ? null : map);
    }
}

function initHeatmap(lat, lng, radius, limit) {
    $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+radius*10+"&limit="+limit*20, function(result) {
              var d = JSON.parse(result).map(x => new google.maps.LatLng(x.lat, x.lng));
              createHeatmap(d);
            });
}

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
          if (map.getZoom() < 8) {
            clearMarkers();
            createHeatmap(JSON.parse(result).map(x => new google.maps.LatLng(x.lat, x.lng)));
          } else {
            clearHeatmap();
            updatePoints(result);
          }
        });
    } else {
        clearHeatmap();
    }
}

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