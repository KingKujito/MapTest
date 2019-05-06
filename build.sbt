name := """MapTest"""
organization := "com.example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.12.8"

libraryDependencies ++= Seq(
  "org.me" % "doobietestproject_2.12" % "0.1",
  "com.opencagedata" %% "scala-opencage-geocoder" % "1.1.1",
  guice
)