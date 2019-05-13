package controllers

import cats.effect.{ContextShift, IO}
import com.opencagedata.geocoder.OpenCageClient
import doobie.Transactor
import javax.inject.Inject
import doobie.util.transactor.Transactor.Aux
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext}
import util._

import scala.util.Try

class GoogleMapsController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  /**
    * Storage object for default values.
    */
  object Default {
    val radius       = 100f
    val limit        = 50
    val zoom         = 5f
    val addressZoom  = 6f
    val extension : models.Extension = models.Earthdistance
  }

  //needed to make calls to the OpenCageData API
  val client = new OpenCageClient("34707abc85774678ac21cf68ecbc193e")

  //needed by Doobie
  implicit val cs: ContextShift[IO] = IO.contextShift(ExecutionContext.global)

  // A transactor that gets connections from java.sql.DriverManager and excutes blocking operations
  // on an unbounded pool of daemon threads. See the chapter on connection handling for more info.
  implicit val xa: Aux[IO, Unit] = Transactor.fromDriverManager[IO](
    "org.postgresql.Driver",                        // driver classname
    "jdbc:postgresql://localhost:5432/postgistest",    // connect URL (driver-specific)
    "postgres",                                       // user
    "lunatech"                                       // password
  )


  /** The main page.
    */
  def index(lat: Option[Float], lon: Option[Float], zoom: Option[Float], radius: Float = Default.radius, limit: Int = Default.limit,
            address : Option[String] = None, geoLat : Option[Float], geoLon: Option[Float]) = Action { request =>

    //Either a geolocation, location retrieved based on address, or no location
    val myPoint: Option[(Float, Float)] =
    //case where geolocation has been specified
      if(geoLat.isDefined && geoLon.isDefined)
        Some((geoLat.get, geoLon.get))

      //case where address has been defined
      else if (address.isDefined)
        Try {
          val responseFuture  = client.forwardGeocode(address.get)
          val response        = Await.result(responseFuture, 5.seconds)
          val latlon          = response.results.head.geometry.get

          (latlon.lat, latlon.lng)
        }.toOption

      //case where no location has been defined
      else None


    //Get locations near the specified position else display no facilities.
    val locations =
      if(myPoint.isDefined) {
        util.getFacilsWithinRadius(myPoint.get._2, myPoint.get._1, radius.toInt, limit, Default.extension)
          .map(f =>
            f.facility
          )
      }
      else
        List.empty

    //Get a starting position for the map based on geo-info of the user's IP-address, if this fails to retrieve a location
    //it will be retried on the frontend.
    //TODO test if request.remoteAddress results in accurate results for people. If not: only use the frontend to retrieve IP position.
    lazy val IPLocation  = getMyLocation(request.remoteAddress)

    //Check if our point is defined. If it is defined, the map on the front end will be centered around this point.
    def checkPoint: Boolean = myPoint.isDefined

    Ok(views.html.googleMap(
      //Center the map based on either a retrieved position, a specified position or an IP position.
      if(checkPoint) myPoint.map(_._1)      else if(lat.isDefined) lat    else IPLocation.map(_._1),
      if(checkPoint) myPoint.map(_._2)      else if(lon.isDefined) lon    else IPLocation.map(_._2),
      if(checkPoint) Default.addressZoom                                  else zoom.getOrElse[Float](Default.zoom),
      myPoint,
      locations,
      //The frontend will try to find an IP position if this returns false.
      //We return true if there is a point we can center on since there's no need to find an IP position if we
      //already know which locations are of interest to the user.
      if(checkPoint || lat.isDefined || lon.isDefined) true else IPLocation.isDefined
    ))
  }


  /** API procedure which returns Facilities.
    */
  def getFacilities (lat: Float = 0, lon: Float = 0, radius: Float = 100, limit: Int = 50) = Action {
    //TODO refactor code to use correct order of latlong so I don't have to do stuff like below (switching up the order)
    val facilities = util.getFacilsWithinRadius(lon, lat, radius.toInt, limit, Default.extension)
      .map(f =>
        f.facility
      )

    Ok("[" +facilities.map{facility =>
      s"""
                    {
                        "lat": ${facility.latitude},
                        "lng": ${facility.longitude},
                        "title": "${facility.name}"
                    }
                    """
    }.mkString(",") + "]")
  }

  /** API procedure which returns Coordinates based on an address.
    */
  def getCoordinates(q : String) = Action {
    val responseFuture  = client.forwardGeocode(q)
    val response        = Await.result(responseFuture, 5.seconds)
    val latlon          = response.results.head.geometry.get

    Ok(
      s"""
         {"lat" : ${latlon.lat},
          "lng" : ${latlon.lng}}
       """.stripMargin)
  }

}