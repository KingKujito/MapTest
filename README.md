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
				('Golfclub Dirkshorn', 52.767276, 4.783118),
				('Golf De Vlietlanden', 52.751141, 5.112016),
				('Golfbaan THE DUNES', 52.404054, 4.554717),
				('Golfplaza Megastore Amsterdam', 52.415216, 4.914581),
				('Golfbaan Het Rijk van Nunspeet', 52.381290, 5.799854),
				('Restaurant Golfclub Noordwijk', 52.291607, 4.468326),
				('Landgoed & Golfbaan Tespelduyn', 52.288237, 4.528991),
				('De Hoge Dijk', 52.297510, 4.962055),
				('Golfcentrum Noordwijk B.V.', 52.235944, 4.468376),
				('Golf & Country Club', 52.193550, 4.743560),
				('Hilversumsche Golf Club', 52.213642, 5.211831),
				('Dutch Golf Putten', 52.243543, 5.515740),
				('Koninklijke Haagsche Golf & Country Club', 52.144793, 4.369514),
				('Wassenaar Golf Groendael', 52.117765, 4.336635),
				('Golfbaan Bentwoud', 52.079078, 4.572796),
				('Seve Golf Center Rotterdam', 51.950901, 4.463148),
				('course Hitland', 51.952542, 4.619137),
				('Golfclub Landgoed Bergvliet', 51.643192, 4.796748),
				('The Duke', 51.726428, 5.561739),
				('Best Golf & Country Club', 51.500460, 5.409003),
				('Golf & Country Club Regthuys', 52.763241, 4.917469),
				('The Heemskerkse Golfclub', 52.513178, 4.712279),
				('De Zandvoortse Golfclub', 52.400169, 4.555841),
				('HGC', 52.359231, 4.654087),
				('Golfclub Ookmeer', 52.388312, 4.797707),
				('Golfpark Spandersbosch', 52.270396, 5.173899),
				('Wassenaar Golf Rozenstein', 52.169536, 4.398678),
				('Hague Golf & Country Club', 52.142830, 4.370977),
				('Golf Course Kromme Rijn', 52.082651, 5.220444),
				('Edese Golf Club Papendal', 52.017848, 5.829672),
				('Golfbaan Crimpenerhout', 51.918259, 4.623357),
				('Domburgsche Golfclub', 51.569897, 3.499227),
				('Golfpark De Haenen', 51.627881, 4.842256),
				('Golfclub Stippelberg', 51.528095, 5.762826),
				('The course Swinkelsche', 51.389733, 5.667790),
				('Course Woold', 51.384434, 5.779812),
				('Westfriese Golfclub', 52.687085, 5.148373),
				('Holland Golf Centre', 52.429981, 4.629956),
				('Sportpark 't Loopveld', 52.338885, 4.895323),
				('Golf 4 All Harderwijk', 52.397458, 5.607342),
				('Sportpark de Star', 52.132010, 4.417374),
				('Rijswijkse Golfclub', 52.041986, 4.345546),
				('Concordia Golf Academy', 52.036831, 4.373172),
				('Golfbaan Kralingen', 51.934320, 4.538132),
				('Course the Crown Prince', 51.978903, 5.085773),
				('Crayestein Golf', 51.829654, 4.749161),
				('Golf Catharinenburg', 51.776817, 4.058392),
				('Efteling Golfpark', 51.645764, 5.034739),
				('Golfpark de Turfvaert', 51.540725, 4.698736),
				('Golfclub Oostburg', 51.330839, 3.459938)
				('Eindhovensche Golf', 51.377533, 5.472147),
				('Golfbaan De Texelse', 53.160969, 4.848433),
				('Golf Mariënweide', 52.367401, 4.584812),
				('Haarlemmermeer Golfclub', 52.370293, 4.667261),
				('Golfbaan Sloten', 52.355985, 4.804358),
				('Golfclub Zeegersloot', 52.155481, 4.696698),
				('Hoenderdaal Golf', 52.066573, 5.268605),
				('Rosendaelsche Golfclub', 52.026882, 5.934197),
				('Course 't Zelle', 52.075272, 6.391357),
				('N.V. Golf Exploitatie Maatschappij Schipluiden', 52.006300, 4.329224),
				('Course 't Zelle', 52.071799, 6.396660),
				('North Brabant Golfclub Toxandria', 51.582958, 4.887483),
				('Efteling Golfpark', 51.662051, 5.030458);

SELECT * FROM facility;
```
Note that the longitude and latitude are switched up on purpose, since the code has been written to take this mistake into account. It is on my TODO list to change this.

### Setup
- Change the info in GoogleMapsController.xa to comply with your local db.
- Run 'sbt run'

### Playground
- http://localhost:9000/
- http://localhost:9000/googlemap
- http://localhost:9000/googlemap?lat=20&lon=20
