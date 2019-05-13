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

  //Allow for real-time updating of map information based on an address.
  //Ajax calls > WebSockets, because we want to minimize the amount of requests whenever possible (Ajax does not
  //negatively affect user experience, nor does WebSockets enrich it in this case).
  document.getElementById('geocoder').addEventListener('click', function() {
      var address = document.getElementById('address').value;
      //Get coordinates of the address.
      $.get("/api/coordinates/js-array?q="+address, function(res) {
        var j = JSON.parse(res);
        var radius = document.getElementById('georadius').value;
        var limit  = (getUrlVars()["limit"] != null) ? getUrlVars()["limit"] : 50;
        //Update the url to allow for sharing/storing queries/results.
        insertParam(
        `[{"key": "address", "val": "${address}"}, { "key": "radius", "val": ${radius} }]`);
        //Update our marker.
        createMyMarker(j.lat, j.lng);
        //Center our map around the address.
        window.map.setCenter({lat: j.lat, lng: j.lng});
        //Get facilities near the address.
        $.get("/api/facilities/js-array?lat="+j.lat+"&lon="+j.lng+"&radius="+radius+"&limit="+limit, function(result) {
            //Create markers for the facilities.
            updatePoints(result);
          });
      });
    });

  //Initialize the map with the markers based on the data from the backend provided at init.
  addMarkers(map);

}

//Google geocoder. Not used atm.
function geocodeAddress(geocoder, resultsMap, marker) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
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

//Retrieve facilities around a position and update the markers.
function getPoints () {
    var lat    = window.myPosMarker.getPosition().lat();
    var lng    = window.myPosMarker.getPosition().lng();
    var limit  = (getUrlVars()["limit"] != null) ? getUrlVars()["limit"] : 50;
    var radius = (getUrlVars()["radius"] != null) ? getUrlVars()["radius"] : 15;

    //Update the url to allow for sharing/storing queries/results.
    insertParam(
    `[{ "key": "geolat", "val": ${lat} }, { "key": "geolon", "val": ${lng} }, { "key": "radius", "val": ${radius} }]`);

    //Make an API call and update the markers based on the retrieved information.
    $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+getUrlVars()["radius"]+"&limit="+limit, function(result) {
      updatePoints(result);
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
                url: "https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2",
                scaledSize: new google.maps.Size(23, 32)},
           title: x.title
           }));

    //Add infowindow functionalities to each marker.
    window.markers.forEach(function(marker) {
        marker.addListener('click', function() {
          window.infowindow.setContent('<span class="info-window">'+marker.getTitle()+'</span>');
          window.infowindow.open(map, marker);
        });});
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
    window.myPosMarker.addListener('click', function() {
      infowindow.setContent('<button onclick="getPoints();">Find Courses!</button>');
      infowindow.open(map, window.myPosMarker);
    });
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

