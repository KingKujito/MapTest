package models

import java.awt.Color

/**
  * Storage object for default values.
  */
object Defaults {
  val radius       = 100f     //for spatial queries
  val limit        = 100      //for spatial queries
  val zoom         = 5f       //for the map view
  val addressZoom  = 6f       //for the map view
  val extension : models.Extension = models.Earthdistance   //for spatial queries

  //Used to represent a facility.
  val golfMarker            : String =
    getMarkerUrl(GolfMarkerStyle(new Color(255,255,255), new Color(5,10,60), new Color(255,255,255)))

  //Used to represent a facility that does not comply with favoured time range.
  val golfIconNotAvailable  : String =
    getMarkerUrl(GolfMarkerStyle(new Color(150,150,150, 100), new Color(0,0,30, 100), new Color(150,150,150, 100)))

  /**Convert a marker style instance to a valid url.
    */
  def getMarkerUrl (marker: GolfMarkerStyle): String =
    s"https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000," +
      s"${toHexString(marker.outline)}," +
      s"${toHexString(marker.background)}," +
      s"${toHexString(marker.icon)}&color=ff000000?scale=" +
      s"${marker.scale}"
  // original:
  // https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2

  /**Converts colors into hex strings (so they can be used in urls).
    * source: https://stackoverflow.com/a/39348473
    */
  def toHexString(c: Color): String = {
    f"${c.getRed}%02x${c.getBlue}%02x${c.getGreen}%02x"
  }

  /**Used to customize golf markers.
    */
  case class GolfMarkerStyle (
                             outline     : Color,
                             background  : Color,
                             icon        : Color,
                             scale       : Int = 2
                             )
}
