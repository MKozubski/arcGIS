import React, { useState, useEffect } from "react";
import { loadModules } from "esri-loader";

const MapWithMarkersAndCharts = () => {
  const [map, setMap] = useState(null);
  const [view, setView] = useState(null);
  const [graphicsLayer, setGraphicsLayer] = useState(null);

  useEffect(() => {
    loadModules(
      ["esri/Map", "esri/views/MapView", "esri/layers/GraphicsLayer"],
      { css: true }
    ).then(([Map, MapView, GraphicsLayer]) => {
      const map = new Map({
        basemap: "streets-navigation-vector",
      });
      const view = new MapView({
        container: "map-view",
        map: map,
        center: [-118.805, 34.027], // lon, lat
        zoom: 13,
      });
      const graphicsLayer = new GraphicsLayer();
      map.add(graphicsLayer);

      setMap(map);
      setView(view);
      setGraphicsLayer(graphicsLayer);
    });
  }, []);

  useEffect(() => {
    if (!graphicsLayer) return;

    const createMarker = async (longitude, latitude) => {
      const [Graphic, Point] = await loadModules([
        "esri/Graphic",
        "esri/geometry/Point",
      ]);

      const point = new Point({
        longitude,
        latitude,
      });

      const popupTemplate = {
        title: "Marker",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "name",
                label: "Name",
              },
              {
                fieldName: "value",
                label: "Value",
              },
            ],
          },
          {
            type: "media",
            mediaInfos: [
              {
                type: "chart",
                title: "Chart",
                caption: "Chart",
                value: {
                  fields: ["name", "value"],
                  series: [
                    {
                      category: "name",
                      value: "value",
                      type: "column",
                      label: {
                        visible: true,
                        format: {
                          places: 0,
                          digitSeparator: true,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const marker = new Graphic({
        geometry: point,
        attributes: {
          name: "Example Marker",
          value: 50,
        },
        popupTemplate: popupTemplate,
      });

      graphicsLayer.add(marker);
    };

    createMarker(-118.805, 34.027);
    createMarker(-118.788, 34.012);
  }, [graphicsLayer]);

  return <div id="map-view" style={{ height: "100vh" }} />;
};

export default MapWithMarkersAndCharts;
