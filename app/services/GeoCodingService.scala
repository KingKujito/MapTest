package services

/**
  * Extend this to create a geo coding component. Used to split up geo coding services to allow for flexible API selection.
  */
trait GeoCodingService {

  /**
    * Convert an address, city, country, POI, etc. into coordinates.
    * @return (latitude, longitude)
    */
  def forwardGeocode(address: String) : (Float, Float)
}
