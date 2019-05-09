import cats.effect.IO
import doobie.util.transactor.Transactor.Aux
import doobie.implicits._
import models.{Extension, Facility, defaultExtension}
import utils.{distanceQuery2, withinQuery2}


package object util {

  /** Convert a point to GEOJSON format and convert the projection to display correctly.
    */
  def pointToJson_(lat: Float, lon: Float, type_ : String = "Point" ) : String = {
    s"""{
      'type': 'Feature',
        'geometry': {
          'type': '$type_',
          'coordinates': ol.proj.transform([$lon, $lat], 'EPSG:4326', 'EPSG:3857')
          }}
    """
  }

  def pointToJson(latlon : (Float,Float), type_ : String = "Point" ) : String = {
    pointToJson_(latlon._1, latlon._2, type_)
  }

  /** Used to store a facility and a float (like a distance).
    */
  case class FacilFloat(facility: Facility, float: Float)

  /** Get facilities and their distance from the specified position.
    */
  def getFacilsWithinRadius(lat: Float, long: Float, radius: Int, limit: Int = 20, extension: Extension = defaultExtension)(implicit xa: Aux[IO, Unit])
  : List[FacilFloat] = {
    (sql"SELECT *, "++distanceQuery2(lat, long,  extension=extension)++fr""" AS dist_in_km
    FROM facility
    WHERE """++withinQuery2(lat, long, radius, extension=extension)++fr"""
    ORDER BY dist_in_km LIMIT $limit""").query[FacilFloat].to[List].transact(xa).unsafeRunSync
  }
}
