# Map test
This is a simple demonstration of the basic functionalities provided by the Google Maps API and the OpenLayers API

### Requirements
- Sbt installed
- Local Postgres DB running
- https://github.com/KingKujito/doobieTestProject published locally
- Generated sample data using either https://github.com/KingKujito/doobieTestProject or https://github.com/KingKujito/PostGIS-test-project

### Setup
- Change the info in GoogleMapsController.xa to comply with your local db.
- Run 'sbt run'

### Playground
- http://localhost:9000/
- http://localhost:9000/googlemap
- http://localhost:9000/googlemap?lat=20&lon=20
- http://localhost:9000/googlemap?geolat=53.53894924055799&geolon=-2.3029403687500007&radius=150&lat=53.053048175708824&lon=-0.12764740000000163&zoom=6

### TODO
- Create abstractions to allow for this to work with any data provided by any source.
- Make this embeddable and usable for any website.