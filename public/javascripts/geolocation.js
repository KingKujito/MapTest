function geoFindMe() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, geoOptions);
      } else {
        console.log("Geolocation services are not supported by your web browser.");
      }
    }

    const success = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const altitude = position.coords.altitude;
      const accuracy = position.coords.accuracy;
      console.log(`latitude: ${latitude}`);
      console.log(`longitude: ${longitude}`);
      console.log(`altitude: ${altitude}`);
      console.log(`accuracy: ${accuracy}`);
      console.log(`(lat, long): (${latitude}, ${longitude})`);
      setInput(latitude,longitude);
    }

    const error = (error) => {
      document.getElementById("geo-form").style.display = "none";
      console.log(`Unable to retrieve your location due to ${error.code}: ${error.message}`);
    }

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000
    };


    function getCoords() {
      return new Promise((resolve, reject) =>
        navigator.permissions ?

          // Permission API is implemented
          navigator.permissions.query({
            name: 'geolocation'
          }).then(permission =>
            // is geolocation granted?
            permission.state === "granted"
              ? updateInput()
              : document.getElementById("geo-form").style.display = "none"
          ) :

        // Permission API was not implemented
        reject(new Error("Permission API is not supported"))
      )
    }

    function updateInput() {
        navigator.geolocation.getCurrentPosition(function(position) {
          setInput(position.coords.latitude, position.coords.longitude);
        });
    }

    function setInput(lat, lon) {
      document.getElementById("allow-geo").innerHTML = "";
      document.getElementById("geo-form").style.display = "block";
      document.getElementById("geolatitude").value = lat;
      document.getElementById("geolongitude").value = lon;
      document.getElementById("last-lat").value = lat;
      document.getElementById("last-lon").value = lon;
    }