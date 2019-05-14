package models

import java.awt.Color
//"https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000,ffffff,db4437,ffffff&color=ff000000?scale=2"
/**
  * Storage object for default values.
  */
object Defaults {
  val radius       = 100f
  val limit        = 100
  val zoom         = 5f
  val addressZoom  = 6f
  val extension : models.Extension = models.Earthdistance

  val golfMarker            : String =
    getMarkerUrl(GolfMarkerStyle(new Color(255,255,255), new Color(5,10,60), new Color(255,255,255)))

  val golfIconNotAvailable  : String =
    getMarkerUrl(GolfMarkerStyle(new Color(150,150,150, 100), new Color(0,0,30, 100), new Color(150,150,150, 100)))

  def getMarkerUrl (marker: GolfMarkerStyle): String =
    s"https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/golf_pinlet-2-medium.png&highlight=ff000000," +
      s"${toHexString(marker.outline)}," +
      s"${toHexString(marker.background)}," +
      s"${toHexString(marker.icon)}&color=ff000000?scale=" +
      s"${marker.scale}"

  //https://stackoverflow.com/a/39348473
  def toHexString(c: Color): String = {
    f"${c.getRed}%02x${c.getBlue}%02x${c.getGreen}%02x"
  }

  case class GolfMarkerStyle (
                             outline     : Color,
                             background  : Color,
                             icon        : Color,
                             scale       : Int = 2
                             )
}
