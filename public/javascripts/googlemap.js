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
                    strictBounds: false,
                  }
      });

  //Create an infowindow for the markers
  window.infowindow = new google.maps.InfoWindow({
    content: 'content loading...'
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
        //Update our marker.
        createMyMarker(j.lat, j.lng);
        //Center our map around the address.
        window.map.setCenter({lat: j.lat, lng: j.lng});
        //Get facilities near the address.
        getPointsAPICall(j.lat, j.lng, radius, getLimit());
      });
    });

  //Initialize the map with the markers.
  //I don't know if checking against findFacilities is all that useful. It might be better to always search for facilities.
  if(window.findFacilities) {
    createMyMarker(lastLat,lastLon);
    getPointsAPICall(lastLat,lastLon,getRadius(),getLimit());
   }
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

//Retrieve facilities around a position and update the markers based on the position of the 'My Location' marker.
function getPoints () {
    var lat    = window.myPosMarker.getPosition().lat();
    var lng    = window.myPosMarker.getPosition().lng();
    var radius = getRadius();

    //Update the url to allow for sharing/storing queries/results.
    insertParam(
    `[{ "key": "geolat", "val": ${lat} }, { "key": "geolon", "val": ${lng} }, { "key": "radius", "val": ${radius} }]`);

    //Make an API call and update the markers based on the retrieved information.
    getPointsAPICall(lat,lng,radius,getLimit());

    //render the heatmap
    initHeatmap(lat, lng, radius, getLimit());
}

//Retrieve facilities around a position and update the markers.
function getPointsAPICall(lat,lng,radius,limit) {
    var timeLow = document.getElementById('time-low').value;
    var timeHigh = document.getElementById('time-high').value;

    //Make a simple 'get all' query if time range is all times.
    if(timeLow == 0 && timeHigh == 24) {
        $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+radius+"&limit="+limit, function(result) {
          updatePoints(result);
        });
    //Make a 'get all within time range' query if time range is specific.
    } else {
        $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+radius+"&limit="+limit+"&timeLow="+timeLow+"&timeHigh="+timeHigh, function(result) {
          updatePoints(result);
        });
    }


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

//Used to retrieve values from the url. Example: for "example.com?q=yes",  getUrlVars()["q"] == "yes"
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

//Add a special marker for a specified position.
function createMyMarker(lat, lng) {
    //Remove old marker if any is present.
    if (window.myPosMarker != null) {
        window.myPosMarker.setMap(null);
    }
    //Add new marker.
    window.myPosMarker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", scaledSize: new google.maps.Size(50, 50)},
        draggable:true,
        title:"Find Courses!"
    });

    //Render the search circle
    drawSearchCircle();

    //Add infowindow functionalities.
    addInfoWindow(window.myPosMarker, '<button onclick="getPoints();">Find Courses!</button>');

    //Update search circle as we move the marker.
    window.myPosMarker.addListener('drag', function() {
          updateSearchCircle();
        });

    //Don't render the search circle if when not relevant.
    window.myPosMarker.addListener('mouseout', function() {
          window.searchCircle.setVisible(false);
        });

    //Render the search circle if when not relevant.
    window.myPosMarker.addListener('mouseover', function() {
          window.searchCircle.setVisible(true);
        });


   //render the heatmap
   initHeatmap(lat, lng, getRadius(), getLimit());
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
function CenterMyPosition(andSearch) {
    $.getJSON('http://ipinfo.io/json?token=63884450bf0425', function(data){
        var location = data.loc.split(",")
        window.map.setCenter({lat: parseFloat(location[0]), lng: parseFloat(location[1])});

        //Also display facilities nearby
        if(andSearch) {
            createMyMarker   (parseFloat(location[0]),  parseFloat(location[1])  );
            getPointsAPICall (parseFloat(location[0]),  parseFloat(location[1]), getRadius(), getLimit());
        }
    });
}

//Retrieve the limit for facilities returned by a query
function getLimit() {
    return getUrlVars()["limit"] != null ? getUrlVars()["limit"] : defaultLimit;
}

//Retrieve the radius for facilities returned by a query
function getRadius() {
    return getUrlVars()["radius"] != null ? getUrlVars()["radius"] : defaultRadius;
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

//Update and display the search circle to comply with the 'my position' marker.
function updateSearchCircle () {
    if (window.searchCircle != null) {
        var pos = window.myPosMarker.getPosition();
        window.searchCircle.setCenter({lat: pos.lat(), lng: pos.lng()});
        window.searchCircle.setVisible(true);
    }
}

//Draw the search circle based on the 'my position' marker
function drawSearchCircle () {
  var pos = window.myPosMarker.getPosition();
  createSearchCircle(pos.lat(), pos.lng(), getRadius());
  window.searchCircle.setVisible(true);
}

//Create the search circle.
function createSearchCircle (lat, lng, rad) {

    //Delete the old circle if one is present.
    if (window.searchCircle != null) {
        window.searchCircle.setMap(null);
    }

    window.searchCircle = new google.maps.Circle({
          strokeColor: '#00701b',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#60c178',
          fillOpacity: 0.1,
          map: map,
          center: {lat: lat, lng: lng},
          //rad = in kilometers, radius = in meters
          radius: (rad * 1000)
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
                          'rgba(100, 100, 100, 0)',
                          'rgba(200, 200, 200, 0)',
                          'rgba(180, 255, 200, 0)'
                        ]
    });
}

function toggleHeatmap() {
    if (window.heatmap != null) {
        window.heatmap.setMap(heatmap.getMap() ? null : map);
    }
}

function initHeatmap(lat, lng, radius, limit) {
    $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+radius*10+"&limit="+limit*20, function(result) {
              var d = JSON.parse(result).map(x => new google.maps.LatLng(x.lat, x.lng));

              createHeatmap(
                d
              );

            });
}