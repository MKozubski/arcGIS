import React, { useState, useEffect } from "react";
import { loadModules } from "esri-loader";
import Select from "react-select";

const MapWithMarkersAndCharts = () => {
  const [graphicsLayer, setGraphicsLayer] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedOption, setSelectedOption] = useState("streets-navigation-vector");
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

  useEffect(() => {
    loadModules(
      ["esri/Map", "esri/views/MapView", "esri/layers/GraphicsLayer"],
      { css: true }
    ).then(([Map, MapView, GraphicsLayer]) => {
      const map = new Map({
        basemap: selectedOption,
      });
      const view = new MapView({
        container: "map-view",
        map: map,
        center: [-105.056455666199327, 69.121805727481842], // lon, lat
        zoom: 13,
      });
      const graphicsLayer = new GraphicsLayer();
      map.add(graphicsLayer);
      setGraphicsLayer(graphicsLayer);
    });
  }, [selectedOption]);

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

      let rand1 = Math.round(Math.random() * 50) + 25;
      let rand2 = Math.round(Math.random() * 50) + 24;

      const popupTemplate = {
        title: "ARF Marker's",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "name",
                label: "Name",
              },
              {
                fieldName: "value1",
                label: "Research Tasks",
              },
              {
                fieldName: "value2",
                label: "Research Staff",
              },
            ],
          },
          {
            type: "media",
            mediaInfos: [
              {
                type: "pie-chart",
                value: {
                  label: {
                    visible: true,
                    format: {
                      places: 0,
                      digitSeparator: true,
                    },
                  },
                  fields: ["value1", "value2"],
                  data: [
                    { value1: rand1, value2: rand2 },
                  ],
                },
              },
            ],
          },
        ],
      };

      let research = "Project " + Math.round(Math.random() * 1000);
      const marker = new Graphic({
        geometry: point,
        attributes: {
          name: research,
          value1: rand1,
          value2: rand2,
        },
        popupTemplate: popupTemplate,
      });

      graphicsLayer.add(marker);
    };

    createMarker(-105.066487127915025, 69.12150364369154);
    createMarker(-105.046487128915050, 69.122674763202667);
  }, [graphicsLayer]);

  function handleChange(e) {
    console.log(e.value);
    setSelectedOption(e.value);
  }

  return <><div id="map-view" style={{ height: "500px",  }} /><div style={{ position: "fixed", top: "30px", right: "350px" }}>
    <div style={{width: "250px"}}>
    <Select
      placeholder={selectedOption}
      value={selectedOption}
      onChange={(e) => handleChange(e)}
      options={options}
      isSearchable={false}
      />
    </div>
  </div></>;
};

export default MapWithMarkersAndCharts;
