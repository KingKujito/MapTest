package controllers

import cats.effect.{ContextShift, IO}
import com.opencagedata.geocoder.OpenCageClient
import doobie.Transactor
import javax.inject.Inject
import models.Facility
import doobie.implicits._
import doobie.util.transactor.Transactor.Aux
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext}
import util._

import scala.util.Try

class GoogleMapsController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  //needed to make calls to the OpenCageData API
  val client = new OpenCageClient("34707abc85774678ac21cf68ecbc193e")

  //needed by Doobie
  implicit val cs: ContextShift[IO] = IO.contextShift(ExecutionContext.global)

  // A transactor that gets connections from java.sql.DriverManager and excutes blocking operations
  // on an unbounded pool of daemon threads. See the chapter on connection handling for more info.
  implicit val xa: Aux[IO, Unit] = Transactor.fromDriverManager[IO](
    "org.postgresql.Driver", // driver classname
    "jdbc:postgresql://localhost:5432/postgistest", // connect URL (driver-specific)
    "postgres",              // user
    "lunatech"                       // password
  )

  def index(lat: Float = 0, lon: Float = 0, zoom: Float = 0, radius: Float = 100, limit: Int = 50,
            address : Option[String] = None, geoLat : Option[Float], geoLon: Option[Float]) = Action {

    var ppp : Option[(Float,Float)]= None

    //Either a geolocation, location retrieved based on address, or no location
    val myPoint =
    //case where geolocation has been specified
      if(geoLat.isDefined && geoLon.isDefined)
        Some((geoLat.get, geoLon.get))

      //case where address has been defined
      else if (address.isDefined)
        Try {
          val responseFuture  = client.forwardGeocode(address.get)
          val response        = Await.result(responseFuture, 5.seconds)
          val latlon          = response.results.head.geometry.get

          ppp = Some((latlon.lat, latlon.lng))
          (latlon.lat, latlon.lng)
        }.toOption

      //case where no location has been defined
      else None


    //get locations near the specified position else display random facilities
    val locations =
      if(myPoint.isDefined) {
        util.getFacilsWithinRadius(myPoint.get._2, myPoint.get._1, radius.toInt, limit)
          .map(f =>
            f.facility
          )
      }
      else
        List.empty

    Ok(views.html.googleMap(
      if(ppp.isDefined) ppp.get._1 else lat,
      if(ppp.isDefined) ppp.get._2 else lon,
      if(ppp.isDefined) 6f else zoom,
      myPoint,
      locations
    ))
  }

  def getFacilities (lat: Float = 0, lon: Float = 0, radius: Float = 100, limit: Int = 50) = Action {
    val facilities = util.getFacilsWithinRadius(lat, lon, radius.toInt, limit)
      .map(f =>
        f.facility
      )

    //accidentally switched up the coordinates
    Ok("[" +facilities.map{facility =>
      s"""
                    {
                        "lat": ${facility.longitude},
                        "lng": ${facility.latitude},
                        "title": "${facility.name}"
                    }
                    """
    }.mkString(",") + "]")
  }

}