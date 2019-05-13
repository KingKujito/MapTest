//https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2

// Initialize and add the map
function initMap() {
  // The map, centered at Uluru
  window.map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: lastZoom,
        center: {lat: lastLat, lng: lastLon},
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

  document.getElementById('geocoder').addEventListener('click', function() {
      var address = document.getElementById('address').value;
      $.get("/api/coordinates/js-array?q="+address, function(res) {
        var j = JSON.parse(res);
        var radius = document.getElementById('georadius').value;
        var limit  = (getUrlVars()["limit"] != null) ? getUrlVars()["limit"] : 50;

        insertParam(
        `[{"key": "address", "val": "${address}"}, { "key": "radius", "val": ${radius} }]`);

        createMyMarker(j.lat, j.lng);

        $.get("/api/facilities/js-array?lat="+j.lat+"&lon="+j.lng+"&radius="+radius+"&limit="+limit, function(result) {
                    updatePoints(result);
                  });
      });
    });

  addMarkers(map);

}

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

var myPos = null;
function getPoints () {
    var lat    = myPos.getPosition().lat();
    var lng    = myPos.getPosition().lng();
    var limit  = (getUrlVars()["limit"] != null) ? getUrlVars()["limit"] : 50;
    var radius = (getUrlVars()["radius"] != null) ? getUrlVars()["radius"] : 15;

    insertParam(
    `[{ "key": "geolat", "val": ${lat} }, { "key": "geolon", "val": ${lng} }, { "key": "radius", "val": ${radius} }]`);


    $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+getUrlVars()["radius"]+"&limit="+limit, function(result) {
      updatePoints(result);
    });
}

function updatePoints (points) {
    var d = JSON.parse(points);

    if (window.markers != null) {
        window.markers.forEach(function(marker) {
          marker.setMap(null);
        });
    }

    window.markers = d.map(x =>
        new google.maps.Marker({
           position: {lat: x.lat, lng: x.lng},
           map: map,
           icon: {
                url: "https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2",
                scaledSize: new google.maps.Size(23, 32)},
           title: x.title
           }));

    window.markers.forEach(function(marker) {
        marker.addListener('click', function() {
          window.infowindow.setContent('<span class="info-window">'+marker.getTitle()+'</span>');
          window.infowindow.open(map, marker);
        });});
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function createMyMarker(lat, lng) {
    if (window.myPosMarker != null) {
        window.myPosMarker.setMap(null);
    }

    window.myPosMarker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", scaledSize: new google.maps.Size(50, 50)},
        draggable:true,
        title:"Find Courses!"
    });

    window.myPosMarker.addListener('click', function() {
      infowindow.setContent('<button onclick="getPoints();">Find Courses!</button>');
      infowindow.open(map, window.myPosMarker);
    });

  myPos = window.myPosMarker;
}


function insertParam(keyvalueJSON) {
        var q     = '';
        var query = JSON.parse(keyvalueJSON).map(kv =>  q += encodeURIComponent(kv.key) + "=" + encodeURIComponent(kv.val) + "&");
        var pos = 'lat=' + encodeURIComponent(map.getCenter().lat()) +
        '&lon=' + encodeURIComponent(map.getCenter().lng()) +
        '&zoom=' + encodeURIComponent(map.getZoom());

        history.pushState(null, '', '/googlemap?'+q+pos);
    }