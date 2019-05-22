package services

import com.opencagedata.geocoder.OpenCageClient
import javax.inject._
import play.api.Configuration
import scala.concurrent.duration._
import scala.concurrent.Await

/**
  * Geo coding service using the OpenCageData API.
  */
@Singleton
class OpenCageDataService @Inject()(config: Configuration) extends GeoCodingService {

  //needed to make calls to the OpenCageData API
  val client = new OpenCageClient(config.get[String]("opencagedata.api.key"))

  /** Convert an address, city, country, POI, etc. into coordinates.
    * @return (latitude, longitude)
    */
  override def forwardGeocode(address: String): (Float, Float) = {
    val responseFuture  = client.forwardGeocode(address)
    val response        = Await.result(responseFuture, 5.seconds)
    val latlon          = response.results.head.geometry.get

    (latlon.lat, latlon.lng)
  }

}
