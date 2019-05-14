import java.sql.Time

import cats.effect.IO
import doobie.util.transactor.Transactor.Aux
import doobie.implicits._
import models.{Extension, Facility, defaultExtension}
import org.json4s.DefaultFormats
import org.json4s.jackson.JsonMethods.parse
import scalaj.http.Http
import utils.{distanceQuery2, withinQuery2}

import scala.util.Try


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

  /** Get facilities and their distance from the specified position. Comply with teetime range.
    */
  def getFacilsWithinRadiusBasedOnTime(
                             teerange:(Int,Int),
                             lat: Float, long: Float,
                             radius: Int, limit: Int = 20,
                             extension: Extension = defaultExtension)(implicit xa: Aux[IO, Unit])
  : List[FacilFloat] = {
    val hightime = if (teerange._2 == 24) new Time(23,59,59) else new Time(teerange._2,0,0)
    (sql"SELECT DISTINCT facility.*, "++distanceQuery2(lat, long,  extension=extension)++fr""" AS dist_in_km
    FROM facility, teetime
    WHERE """++withinQuery2(lat, long, radius, extension=extension)++fr""" AND teetime.time_ >= ${new Time(teerange._1,0,0)} AND teetime.time_ <= ${hightime} AND facility.id = teetime.facility
    ORDER BY dist_in_km LIMIT $limit""").query[FacilFloat].to[List].transact(xa).unsafeRunSync
  }

  /** Get facilities and their distance from the specified position. Comply with teetime range. Only return non time-compliant.
    */
  def getFacilsWithinRadiusInverseOnTime(
                                        teerange:(Int,Int),
                                        lat: Float, long: Float,
                                        radius: Int, limit: Int = 20,
                                        extension: Extension = defaultExtension)(implicit xa: Aux[IO, Unit])
  : List[FacilFloat] = {
    val hightime = if (teerange._2 == 24) new Time(23,59,59) else new Time(teerange._2,0,0)
    (sql"SELECT DISTINCT facility.*, "++distanceQuery2(lat, long,  extension=extension)++fr""" AS dist_in_km
    FROM facility, teetime
    WHERE """++withinQuery2(lat, long, radius, extension=extension)++fr""" AND teetime.time_ NOT BETWEEN ${new Time(teerange._1,0,0)} AND ${hightime} AND facility.id = teetime.facility
    ORDER BY dist_in_km LIMIT $limit""").query[FacilFloat].to[List].transact(xa).unsafeRunSync
  }


  /**Converts a JSON string into a key->value map
    */
  def jsonStrToMap(jsonStr: String): Map[String, Any] = {
    implicit val formats: DefaultFormats.type = org.json4s.DefaultFormats
    parse(jsonStr).extract[Map[String, Any]]
  }

  /** Get coordinates based on an IP address
    */
  def getMyLocation(ip : String): Option[(Float,Float)] = {
    def mapToLocation(map : Map[String, Any]) = map.get("loc").map {
      case s: String =>
        val f = s.split(",").map(_.toFloat).toList
        (f.head, f.reverse.head)
    }.get

    Try {
      mapToLocation(jsonStrToMap(
        Http(s"https://ipinfo.io/$ip/json").param("token", "63884450bf0425").asString.body
      ))
    }.toOption
  }
}
