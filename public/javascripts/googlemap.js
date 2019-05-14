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
}

//Retrieve facilities around a position and update the markers.
function getPointsAPICall(lat,lng,radius,limit) {
    var timeLow = document.getElementById('time-low').value;
    var timeHigh = document.getElementById('time-high').value;

    if(timeLow == 0 && timeHigh == 24) {
        $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+radius+"&limit="+limit, function(result) {
          updatePoints(result);
        });
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

    //Add infowindow functionalities.
    addInfoWindow(window.myPosMarker, '<button onclick="getPoints();">Find Courses!</button>');
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

