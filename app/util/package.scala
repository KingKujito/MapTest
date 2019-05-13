import java.net.InetAddress

import cats.effect.IO
import doobie.util.transactor.Transactor.Aux
import doobie.implicits._
import models.{Extension, Facility, defaultExtension}
import org.json4s.DefaultFormats
import org.json4s.jackson.JsonMethods.parse
import scalaj.http.Http
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

  def getIp: String = {
    import java.net.DatagramSocket

    val socket: DatagramSocket = new DatagramSocket()
    socket.connect(InetAddress.getByName("8.8.8.8"), 10002)
    socket.getLocalAddress.getHostAddress
  }

  def jsonStrToMap(jsonStr: String): Map[String, Any] = {
    implicit val formats: DefaultFormats.type = org.json4s.DefaultFormats
    parse(jsonStr).extract[Map[String, Any]]
  }

  def getMyLocation: (Float,Float) = {
    jsonStrToMap(
      Http("https://ipinfo.io/json").param("token","63884450bf0425").asString.body
    ).get("loc").map {
      case s: String =>
        val f = s.split(",").map(_.toFloat).toList
        (f.head, f.reverse.head)
    }.get
  }
}
