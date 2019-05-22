# Map test
This is a simple demonstration of the basic functionalities provided by the Google Maps API and the OpenLayers API

### Requirements
- Sbt installed
- Local Postgres DB running
- https://github.com/KingKujito/doobieTestProject published locally
- Generated sample data using either https://github.com/KingKujito/doobieTestProject or https://github.com/KingKujito/PostGIS-test-project or create a new local database and execute these queries:
```
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SEQUENCE IF NOT EXISTS facility_id_seq;


CREATE TABLE IF NOT EXISTS facility (
		  name character varying(50) COLLATE pg_catalog."default" NOT NULL,
		  longitude decimal,
		  latitude decimal,
		  id bigint NOT NULL DEFAULT nextval('facility_id_seq'::regclass),
		  CONSTRAINT facility_pkey PRIMARY KEY (id)
	  )
	  WITH ( OIDS = FALSE )
	  TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS teetime (
		  time_ time NOT NULL,
		  facility bigint NOT NULL,
		  CONSTRAINT facility FOREIGN KEY (facility)
			  REFERENCES public.facility (id) MATCH SIMPLE
			  ON UPDATE NO ACTION
			  ON DELETE CASCADE
	  )
	  WITH ( OIDS = FALSE )
	  TABLESPACE pg_default;


DELETE FROM facility;

INSERT INTO
        facility (
                name,
                longitude,
                latitude
        )
VALUES
        ('Golf Club BurgGolf Purmerend', 52.505475, 4.996134),
        ('Amsterdamse Golf Club', 52.412177, 4.747435),
        ('Kennemer Golf & Country Club', 52.382161, 4.554802),
        ('The International', 52.339878, 4.807520),
        ('Golfclub Amsterdam Old Course', 52.324408, 4.933771),
        ('Restaurant Golfclub Noordwijk', 52.306618, 4.464175),
        ('Hilversumsche Golf Club', 52.217366, 5.209659),
        ('Wassenaar Golf Rozenstein', 52.168918, 4.393222),
        ('Golfclub Zeegersloot', 52.177268, 4.699759),
        ('Koninklijke Haagsche Golf & Country Club', 52.157135, 4.368633),
        ('UGC De Pan', 52.126617, 5.221991),
        ('Golf course BurgGolf Zoetermeer', 52.068237, 4.442674),
        ('Rijswijkse Golfclub', 52.050642, 4.351820),
        ('Golfbaan Delfland', 51.991639, 4.330091),
        ('Golf De Hooge Rotterdamsche', 51.981614, 4.524358),
        ('Golfclub Broekpolder', 51.944435, 4.316574),
        ('Seve Golf Center Rotterdam', 51.954658, 4.455979),
        ('course Hitland', 51.954579, 4.614557),
        ('The Dutch', 51.864011, 5.023709),
        ('Golf Club Spaarnwoude', 52.439738, 4.702721),
        ('Zaanse Golf Club', 52.482022, 4.862805),
        ('Golf Houtrak', 52.411870, 4.727356),
        ('Restaurant Golfclub Noordwijk', 52.291270, 4.468769),
        ('Golfcentrum Amsteldijk', 52.285591, 4.877595),
        ('Golfsociëteit Lage Vuursche', 52.161238, 5.243380),
        ('Golfclub De Hoge Kleij', 52.141914, 5.363546),
        ('Golfclub De Haar', 52.132396, 4.991160),
        ('Golfbaan Bentwoud', 52.081428, 4.572644),
        ('Utrecht Golfclub Amelisweerd', 52.069464, 5.148947),
        ('Rosendaelsche Golfclub', 52.030282, 5.930388),
        ('Stichting GolfClub Zuid Holland', 51.950443, 4.588750),
        ('Pitch & Putt Golf Rhoon', 51.858077, 4.417299),
        ('Golf Grevelingenhout', 51.676951, 4.059700),
        ('The Heemskerkse Golfclub', 52.502543, 4.708556),
        ('Golfclub Ookmeer', 52.383151, 4.806949),
        ('Best Golf & Country Club', 51.499207, 5.410502),
        ('Golfcentrum Noordwijk B.V.', 52.228202, 4.465907),
        ('Golfbaan Crimpenerhout', 51.906942, 4.622354),
        ('Stichting Golf Duinzicht', 52.111055, 4.338959),
        ('Haagse Golfvereniging Leeuwenbergh', 52.061100, 4.363539),
        ('Golfpark Rotterdam', 51.951888, 4.405630),
        ('Golfclub Kagerzoom', 52.191971, 4.503555),
        ('Pitch & Putt Golf Rhoon', 51.849486, 4.418810),
        ('Landgoed Vereniging Golfclub Cromstrijen', 51.725820, 4.415562),
        ('Golfclub Capelle', 51.942057, 4.592509),
        ('Course Schinkelshoek', 51.913978, 4.301193),
        ('Footgolf. Rhoon', 51.850335, 4.417445),
        ('Rhoon Golf Center B.V.', 51.840922, 4.462594),
        ('Hans von Burg Golf Activity Center, Von Burg Golf', 51.944601, 4.592308),
        ('Clubgolf Club Voor Vrije Golfers', 51.927211, 4.468624),
        ('Indoor Golf Academy Barendrecht', 51.864458, 4.518929),
        ('Golfclub Ockenburgh', 52.060395, 4.217677),
        ('Golfpark Groendael B.V.', 52.111057, 4.337582),
        ('Golf club Oude Maas', 51.840079, 4.461219),
        ('Peter Graham Golf Center', 52.132278, 4.642373),
        ('ANWB Golf', 52.294969, 4.702744),
        ('Oegstgeester golfclub', 52.191402, 4.464274),
        ('Nederland Golft', 51.947149, 4.589585);
		
SELECT * FROM facility;
```

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
