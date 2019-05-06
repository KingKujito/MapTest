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

class HomeController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  implicit val cs: ContextShift[IO] = IO.contextShift(ExecutionContext.global)

  val client = new OpenCageClient("34707abc85774678ac21cf68ecbc193e")

  // A transactor that gets connections from java.sql.DriverManager and excutes blocking operations
  // on an unbounded pool of daemon threads. See the chapter on connection handling for more info.
  implicit val xa: Aux[IO, Unit] = Transactor.fromDriverManager[IO](
    "org.postgresql.Driver", // driver classname
    "jdbc:postgresql://localhost:5432/postgistest", // connect URL (driver-specific)
    "postgres",              // user
    "lunatech"                       // password
  )

  def index(lat: Float = 0, lon: Float = 0, zoom: Float = 0, radius: Float = 100, address : Option[String] = None) = Action {

    println("\n\n")

    val myPoint =
    if (address.isDefined) {
      println(address.get)
      Try {
        val responseFuture = client.forwardGeocode(address.get)
        val response = Await.result(responseFuture, 5.seconds)
        println(response.results)

        val latlon = response.results.head.geometry.get
        println(latlon.lat, latlon.lng)

        (latlon.lat, latlon.lng)
      }.toOption
    } else None

    val locations = /*List(
      pointToJson((51.9136881f,4.4806825f)),
      pointToJson((0,0)),
      pointToJson((0,40)),
      pointToJson((40,40)),
      pointToJson((80,80))
    )*/
      if(myPoint.isDefined) {
        val facilitiesNearby =
          util.getFacilsWithinRadius(myPoint.get._2, myPoint.get._1, radius.toInt, limit = 50)
            .map(f =>
              f.facility
            )

        facilitiesNearby.map(fac => pointToJson((fac.latitude.toFloat, fac.longitude.toFloat)))
      }
      else
        Facility.getAll(Some(50)).query[Facility].to[List].transact(xa).unsafeRunSync.map(
          fac => pointToJson((fac.latitude.toFloat, fac.longitude.toFloat))
        )


    val myLocation = myPoint.map(p => pointToJson((p._1,p._2)))

    Ok(views.html.index(
      lat,
      lon,
      zoom,
      myLocation,
      locations
    ))
  }

}
