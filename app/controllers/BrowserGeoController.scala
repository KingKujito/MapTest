package controllers

import javax.inject.Inject

import play.api.mvc._

class BrowserGeoController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def index = Action {
    Ok(views.html.indexgeo())
  }

}
