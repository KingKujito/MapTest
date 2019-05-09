//https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2
var map = null;
var infowindow2 = null;
// Initialize and add the map
function initMap() {
  // The map, centered at Uluru
  map = new google.maps.Map(
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

  addMarkers(map);

  infowindow2 = new google.maps.InfoWindow({
    content: 'content loading...'
  });

  //google.maps.event.addListenerOnce(map, 'idle', function(){
  //  jQuery('.gm-style-iw').prev('div').remove();
  //});
}

var myPos = null;
function getPoints () {
    var lat    = myPos.getPosition().lat();
    var lng    = myPos.getPosition().lng();
    var limit  = (getUrlVars()["limit"] != null) ? getUrlVars()["limit"] : 50;


    $.get("/api/facilities/js-array?lat="+lat+"&lon="+lng+"&radius="+getUrlVars()["radius"]+"&limit="+limit, function(result) {
      updatePoints(result);
    });
}

var newMarkers = null;
function updatePoints (points) {
    var d = JSON.parse(points);

    if (newMarkers != null) {
        newMarkers.forEach(function(marker) {
          marker.setMap(null);
        });
    }

    newMarkers = d.map(x =>
        new google.maps.Marker({
           position: {lat: x.lat, lng: x.lng},
           map: map,
           icon: {
                url: "https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2",
                scaledSize: new google.maps.Size(23, 32)},
           title: x.title
           }));

    newMarkers.forEach(function(marker) {
        marker.addListener('click', function() {
          infowindow2.setContent('<span class="info-window">'+marker.getTitle()+'</span>');
          infowindow2.open(map, marker);
        });});
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}