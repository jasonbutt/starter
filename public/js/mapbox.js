/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiamFzb25idSIsImEiOiJja2tzZmp5cTMwOXh3Mm9zNGFrZ2ZtZzF4In0.C25Tf3oWx0KhQkslTYd4WA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jasonbu/ckksfyfpj0ajz17o988332qcl',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 150,
      bottom: 100,
      left: 100,
      right: 100,
    },
  });
};
