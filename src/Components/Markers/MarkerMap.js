import React, { useState, useEffect } from "react";
import { loadModules } from "esri-loader";
import gpxParser from "gpxparser";
import GPX_FILE_CONTENTS from "./Track_20-JUN-14_22-JUN-14.gpx";
import Select from "react-select";
import EXIF from "exif-js";
var exifr = require("exifr"); 

function importAll(r) {
  return r.keys().map(r);
}

export default function MapWithMarkers() {
  const [data, setData] = useState("");
  const [geoJSON, setGeoData] = useState(null);
  const [name, setName] = useState("");
  const [selectedOption, setSelectedOption] = useState("streets-navigation-vector");
  const [imageDetails, setImageDetails ] = useState();
  const minZoom = 3;
  const maxZoom = 16;
  const options = [
    { value: "streets-navigation-vector", label: "Street" },
    { value: "oceans", label: "Oceans" },
    { value: "topo-vector", label: "Topographic" },
    { value: "terrain", label: "Terrain" },
    { value: "satellite", label: "Satellite" },
    { value: "osm", label: "Open-Street-Map" },
    { value: "hybrid", label: "Hybrid" },
    { value: "gray-vector", label: "Gray" },
    { value: "dark-gray-vector", label: "Dark Grey" }
  ];

  const images = importAll(require.context('./Images/', false, /\.(png|jpe?g|svg|JPG)$/));
  console.log(images);
  async function getImageDetails() {
    console.log(EXIF);
    var img = images[0];
    console.log(exifr);
    exifr.parse(img).then((output) => console.log("Camera:", output));
    var exifdata = await exifr.gps(img);
    console.log("latitude ", exifdata.latitude);
    console.log("longitude", exifdata.longitude);
    setImageDetails([exifdata.latitude, exifdata.longitude]);

  }
  console.log(imageDetails);

  // Fetched the contents of the gpx file
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(GPX_FILE_CONTENTS);
      const text = await response.text();
      setData(text);
    }
    fetchData();
  }, [selectedOption]);

  // Converts the contents of the GPX to a geoJSON format
  useEffect(() => {
    if (data === "") {
      return;
    }
    let gpx = new gpxParser();
    gpx.parse(data);
    console.log(gpx.toGeoJSON().features[0].properties.name);
    setName(gpx.toGeoJSON().features[0].properties.name);
    setGeoData(gpx.toGeoJSON().features[0].geometry.coordinates);
  }, [data, selectedOption]);

  // creates the map and view
  useEffect(() => {
    if (!geoJSON) {
      return;
    }

    const pictures = images;

    if(!selectedOption){
      setSelectedOption("streets-navigation-vector");
    }

    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
      ],
      { css: true }
    )
      .then(([Map, MapView, FeatureLayer, Graphic]) => {
        // creates the map
        const newMap = new Map({
          basemap: selectedOption,
        });

        // creates the view (assignment unneeded)
        const view = new MapView({
          container: "viewDiv",
          map: newMap,
          center: [-105.04560470581056, 69.11868280984892],
          zoom: minZoom,
          constraints: {
            minZoom: minZoom,
            maxZoom: maxZoom,
          },
        });

        // creates graphics from geoJSON coordinates
        const graphics = geoJSON.map((coord) => {
          return new Graphic({
            geometry: {
              type: "point",
              longitude: coord[0],
              latitude: coord[1],
            },
          });
        });

        // Define a pop-up for Trailheads
        const popupTrailheads = {
          title: "Location",
          content: (feature) => {
            const lat = feature.graphic.geometry.latitude.toFixed(6);
            const lon = feature.graphic.geometry.longitude.toFixed(6);
            console.log(pictures[1]);
            return `
        <div>
          <p>Latitude: ${lat}</p>
          <p>Longitude: ${lon}</p>
          <img src=${pictures[1]} alt="View" style="width:252px;height:25px;" />
        </div>
      `;
          },
        };

        // creates the feature layer
        const featureLayer = new FeatureLayer({
          source: graphics,
          objectIdField: "OBJECTID",
          geometryType: "point",
          popupTemplate: popupTrailheads,
          spatialReference: {
            wkid: 4326,
          },
          fields: [
            {
              name: "OBJECTID",
              alias: "Object ID",
              type: "oid",
            },
          ],
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              color: [0, 0, 255, 0.5],
              size: 10,
              outline: {
                color: [255, 255, 255],
                width: 1,
              },
            },
          },
        });

        // add click event listener to feature layer
        featureLayer.on("click", (event) => {
          // access the clicked graphic
          const clickedGraphic = event.graphic;

          // create a new popup template for the clicked graphic
          const popupTemplate = {
            title: "Marker",
            content: `Latitude: ${clickedGraphic.geometry.latitude.toFixed(
              6
            )}, Longitude: ${clickedGraphic.geometry.longitude.toFixed(6)}`,
          };

          // set the new popup template for the feature layer
          featureLayer.popupTemplate = popupTemplate;

          // open the popup for the clicked graphic
          view.popup.open({
            title: popupTemplate.title,
            content: popupTemplate.content,
            location: clickedGraphic.geometry,
          });
        });
        getImageDetails();
        newMap.add(featureLayer);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [geoJSON, minZoom, maxZoom, selectedOption]);

  //

  function handleChange(e) {
    console.log(e.value);
    setSelectedOption(e.value);
  }
  // Returns the completed map
  return (
    <>
      <div>
        <h2>{name}</h2>
      </div>
      <div id="viewDiv" style={{ width: "600px", height: "400px" }}></div>
      <div style={{ position: "fixed", top: "100px", right: "350px" }}>
        <Select
          value={selectedOption}
          onChange={(e) => handleChange(e)}
          options={options}
        />
      </div>
    </>
  );
}
