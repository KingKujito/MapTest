import org.osgeo.proj4j._
import java.awt.geom.Point2D

import cats.effect.IO
import doobie.util.transactor.Transactor.Aux
import doobie.implicits._
import models.{Extension, Facility, defaultExtension}
import utils.{FacilTeeFloat, distanceQuery2, withinQuery2}


package object util {
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

  def rangeMapper(value: Float, start1: Float, stop1: Float, start2: Float, stop2: Float): Float = {
    start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
  }

  /*
-20026376.39  -20048966.10
 20026376.39   20048966.10

-180.0  -90.0
 180.0   90.0
   */

  case class FacilFloat(facility: Facility, float: Float)

  def getFacilsWithinRadius(lat: Float, long: Float, radius: Int, limit: Int = 20, extension: Extension = defaultExtension)(implicit xa: Aux[IO, Unit])
  : List[FacilFloat] = {
    (sql"SELECT *, "++distanceQuery2(lat, long,  extension=extension)++fr""" AS dist_in_km
    FROM facility
    WHERE """++withinQuery2(lat, long, radius, extension=extension)++fr"""
    ORDER BY dist_in_km LIMIT $limit""").query[FacilFloat].to[List].transact(xa).unsafeRunSync
  }
}
