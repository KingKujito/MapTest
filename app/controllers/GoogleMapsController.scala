package controllers

import cats.effect.{ContextShift, IO}
import doobie.Transactor
import javax.inject._
import doobie.util.transactor.Transactor.Aux
import play.api.mvc._
import scala.concurrent.ExecutionContext
import util._
import models.Defaults
import play.api.Configuration
import services._

import scala.util.Try

object GoogleMapsController{
  //Use OpenCageData for geocoding
  type GeocodingService = OpenCageDataService
}

@Singleton
class GoogleMapsController @Inject()(
                                      cc                : ControllerComponents,
                                      geocodingService  : GoogleMapsController.GeocodingService,
                                      implicit val config : Configuration
                                    )
  extends AbstractController(cc) {

  //needed by Doobie
  implicit val cs: ContextShift[IO] = IO.contextShift(ExecutionContext.global)

  // A transactor that gets connections from java.sql.DriverManager and excutes blocking operations
  // on an unbounded pool of daemon threads. See the chapter on connection handling for more info.
  implicit val xa: Aux[IO, Unit] = Transactor.fromDriverManager[IO](
    "org.postgresql.Driver",                        // driver classname
    "jdbc:postgresql://localhost:5432/postgistest2",    // connect URL (driver-specific), postgistest for data quantity, postgistest2 for data quality
    "postgres",                                       // user
    "lunatech"                                       // password
  )


  /** The main page.
    */
  def index(lat: Option[Float], lon: Option[Float], zoom: Option[Float], radius: Float = Defaults.radius, limit: Int = Defaults.limit,
            address : Option[String] = None, geoLat : Option[Float], geoLon: Option[Float]) = Action { request =>

    //Either a geolocation, location retrieved based on address, or no location
    val myPoint: Option[(Float, Float)] =
    //case where geolocation has been specified
      if(geoLat.isDefined && geoLon.isDefined)
        Some((geoLat.get, geoLon.get))

      //case where address has been defined
      else if (address.isDefined)
        Try {
          geocodingService.forwardGeocode(address.get)
        }.toOption

      //case where no location has been defined
      else None

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
      if(checkPoint) Defaults.addressZoom                                 else zoom.getOrElse[Float](Defaults.zoom),
      myPoint,
      //The frontend will try to find an IP position if this returns false.
      //We return true if there is a point we can center on since there's no need to find an IP position if we
      //already know which locations are of interest to the user.
      if(checkPoint || lat.isDefined || lon.isDefined) true else IPLocation.isDefined
    ))
  }

  /** API procedure which returns Facilities based on a view port.
    */
  def getFacilitiesWithinBounds(north: Float, south: Float, east: Float, west: Float,
                                limit: Option[Int] = None,
                                timeRangeLow: Option[Int] = None,
                                timeRangeHigh: Option[Int] = None
                               ) = Action {
    val facilities =
      if(timeRangeLow.isDefined && timeRangeHigh.isDefined && !(timeRangeLow.get == 0 && timeRangeHigh.get == 24))
        util.getFacilitiesWithinBoundsWithinTime(north, south, east, west, (timeRangeLow.get, timeRangeHigh.get), false, limit)
          .map(f =>
            (f, Defaults.golfMarker)).:::(
          util.getFacilitiesWithinBoundsWithinTime(north, south, east, west, (timeRangeLow.get, timeRangeHigh.get), true, limit)
            .map(f =>
              (f, Defaults.golfIconNotAvailable))
        )
      else
        util.getFacilitiesWithinBounds(north, south, east, west, limit)
          .map(f =>
            (f, Defaults.golfMarker))

    Ok(facilityStringToJson(facilities))
  }



  /** API procedure which returns Facilities.
    */
  def getFacilities (
                      lat: Float     = 0,      lon: Float = 0,
                      radius: Float  = 100,    limit: Int = 50,
                      timeRangeLow: Option[Int] = None,
                      timeRangeHigh: Option[Int] = None
                    ) = Action {
    //TODO refactor code to use correct order of latlong so I don't have to do stuff like below (switching up the order)
    val facilities =
      if(timeRangeLow.isDefined && timeRangeHigh.isDefined)
        //Return all facilities within radius complying with time preference and display them normally.
        util.getFacilsWithinRadiusBasedOnTime((timeRangeLow.get, timeRangeHigh.get), lon, lat, radius.toInt, limit, Defaults.extension)
          .map(f =>
            (f.facility, Defaults.golfMarker)
          ).:::(
          //Return all facilities within radius not complying with time preference and display them differently.
          util.getFacilsWithinRadiusInverseOnTime((timeRangeLow.get, timeRangeHigh.get), lon, lat, radius.toInt, (limit*0.6).toInt, Defaults.extension)
            .map(f =>
              (f.facility, Defaults.golfIconNotAvailable)
            ))
      else
        //Return all facilities within radius and display them normally.
        util.getFacilsWithinRadius(lon, lat, radius.toInt, limit, Defaults.extension)
          .map(f =>
            (f.facility, Defaults.golfMarker)
          )

    Ok(facilityStringToJson(facilities))
  }

  /** API procedure which returns Coordinates based on an address.
    */
  def getCoordinates(q : String) = Action {
    val latlon          = geocodingService.forwardGeocode(q)

    Ok(
      s"""
         {"lat" : ${latlon._1},
          "lng" : ${latlon._2}}
       """.stripMargin)
  }

}