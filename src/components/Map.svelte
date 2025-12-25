<script>
  import { onMount, onDestroy } from 'svelte';
  import * as maptilersdk from '@maptiler/sdk';
  import '@maptiler/sdk/dist/maptiler-sdk.css';
  import maplibregl from "maplibre-gl";
  import 'maplibre-gl/dist/maplibre-gl.css';

  import route2025 from '../data/route2025.json';
  import route2019 from '../data/route2019.json';
  import route2016 from '../data/route2016.json';
  import stops2025 from '../data/stops2025.json';
  import stops2019 from '../data/stops2019.json';
  import stops2016 from '../data/stops2016.json';

  import ElevationProfile from './Graph.svelte';


  let map;
  let mapContainer;

  let scale = new maplibregl.ScaleControl({
    maxWidth: 100,
    unit: "imperial",
  });

  //**** STATS ****//
  const YEAR_STATS = {
    2025: {
      miles: 1813,
      days: 28,
      states: ['ND', 'MN', 'WI', 'MI', 'IN', 'OH', 'WV', 'PA', 'MD']
    },
    2019: {
      miles: 890,
      days: 12,
      states: ['MT', 'ND']
    },
    2016: {
      miles: 1224,
      days: 15,
      states: ['OR', 'WA', 'ID', 'MT']
    }
  };

    // **** CONTROL BUTTONS **** //
    let show2025 = true;
    let show2019 = true;
    let show2016 = true;
    let mapLoaded = false;

    const YEAR_COLORS = {
      2025: '#DC4633',
      2019: '#00A189',
      2016: '#1E3765'
    };

  $: totalMiles =
    (show2025 ? YEAR_STATS[2025].miles : 0) +
    (show2019 ? YEAR_STATS[2019].miles : 0) +
    (show2016 ? YEAR_STATS[2016].miles : 0);

  $: totalDays =
    (show2025 ? YEAR_STATS[2025].days : 0) +
    (show2019 ? YEAR_STATS[2019].days : 0) +
    (show2016 ? YEAR_STATS[2016].days : 0);

  // $: totalStates =
  //   (show2025 ? YEAR_STATS[2025].states : 0) +
  //   (show2019 ? YEAR_STATS[2019].states : 0) +
  //   (show2016 ? YEAR_STATS[2016].states : 0);

  $: totalStates = new Set(
    activeYears.flatMap(year => YEAR_STATS[year].states)
  ).size;

  $: activeYears = [2025, 2019, 2016].filter(
    year => (year === 2025 && show2025) || 
            (year === 2019 && show2019) || 
            (year === 2016 && show2016)
  );

  


  $: statColor = activeYears.length === 1 
      ? YEAR_COLORS[activeYears[0]] 
      : '#000'; // black if multiple years

    function toggleLayer(layerId, visible) {
      if (!map || !map.getLayer(layerId)) return;

      map.setLayoutProperty(
        layerId,
        'visibility',
        visible ? 'visible' : 'none'
      );
    }

    function toggle2025UI() {
      show2025 = !show2025;
      toggleLayer('route-2025-layer', show2025);
      updateStopsVisibility(2025);
    }

    function toggle2019UI() {
      show2019 = !show2019;
      toggleLayer('route-2019-layer', show2019);
      updateStopsVisibility(2019);
    }

    function toggle2016UI() {
      show2016 = !show2016;
      toggleLayer('route-2016-layer', show2016);
      updateStopsVisibility(2016);
    }


  const STOPS_MIN_ZOOM = 4;

    function updateStopsVisibility(year) {
      if (!map) return;

      const layerId = `stops-${year}-layer`;
      if (!map.getLayer(layerId)) return;

      const zoom = map.getZoom();
      const show =
        (year === 2025 && show2025 ||
         year === 2019 && show2019 ||
         year === 2016 && show2016) &&
        zoom >= STOPS_MIN_ZOOM;

      toggleLayer(layerId, show);
    }

  function svgToImage(svgText) {
    const svg = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svg);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.src = url;
    });
  }



  onMount(() => {
    maptilersdk.config.apiKey = '66rTvTjbUbMnniaYtYPI';

    map = new maplibregl.Map({
      container: mapContainer,
      //style: "https://api.maptiler.com/maps/dataviz-v4/style.json?key=66rTvTjbUbMnniaYtYPI"
      style: "https://api.maptiler.com/maps/dataviz-v4/style.json?key=66rTvTjbUbMnniaYtYPI",
      center: [-98, 39],
      zoom: 3.5,
      projection: "globe"
    });

    map.addControl(scale, "bottom-left");
    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    // **** ROUTES + STOPS **** //

    map.on('load', async () => {
      mapLoaded = true;
      map.addSource('route-2025-source', {
        type: 'geojson',
        data: route2025
      });

      map.addLayer({
        id: 'route-2025-layer',
        type: 'line',
        source: 'route-2025-source',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#DC4633',
          'line-width': 3
        }
      });

      map.addSource('route-2019-source', {
        type: 'geojson',
        data: route2019
      });

      map.addLayer({
        id: 'route-2019-layer',
        type: 'line',
        source: 'route-2019-source',
        paint: {
          'line-color': '#00A189',
          'line-width': 3
        }
      });

      map.addSource('route-2016-source', {
        type: 'geojson',
        data: route2016
      });

      map.addLayer({
        id: 'route-2016-layer',
        type: 'line',
        source: 'route-2016-source',
        paint: {
          'line-color': '#1E3765',
          'line-width': 3
        }
      });

      map.addSource('stops-2025-source', {
        type: 'geojson',
        data: stops2025
      });

      map.addLayer({
        id: 'stops-2025-layer',
        type: 'circle',
        source: 'stops-2025-source',
        paint: {
          'circle-color': '#fff',
          'circle-stroke-color': '#DC4633',
          'circle-stroke-width': 2,
          'circle-radius': 4
        }
      });

      map.addLayer({
        id: 'stops-2025-highlight-layer',
        type: 'symbol',
        source: 'stops-2025-source',
        filter: ['==', ['get', 'highlight'], true],
        layout: {
          'icon-image': 'highlight-icon',
          'icon-size': 0.9,
          'icon-allow-overlap': true,
          'icon-offset': [8, -11]
        }
      });


      map.addSource('stops-2019-source', {
        type: 'geojson',
        data: stops2019
      });

      map.addLayer({
        id: 'stops-2019-layer',
        type: 'circle',
        source: 'stops-2019-source',
        paint: {
          'circle-color': '#fff',
          'circle-stroke-color': '#00A189',
          'circle-stroke-width': 2,
          'circle-radius': 4
        }
      });

      map.addSource('stops-2016-source', {
        type: 'geojson',
        data: stops2016
      });

      map.addLayer({
        id: 'stops-2016-layer',
        type: 'circle',
        source: 'stops-2016-source',
        paint: {
          'circle-color': '#fff',
          'circle-stroke-color': '#1E3765',
          'circle-stroke-width': 2,
          'circle-radius': 4
        }
      });

      updateStopsVisibility(2025);
      updateStopsVisibility(2019);
      updateStopsVisibility(2016);

      const starSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag-icon lucide-flag"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg>`;

      const img = await svgToImage(starSvg);
      map.addImage('highlight-icon', img);




    });

    // ***** STOPS HOVER ABLES **** //
    map.on('zoom', () => {
      updateStopsVisibility(2025);
      updateStopsVisibility(2019);
      updateStopsVisibility(2016);
    });

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    let currentFeatureCoordinates = undefined;
    
    map.on('mousemove', 'stops-2025-layer', (e) => {
      const featureCoordinates = e.features[0].geometry.coordinates.toString();
      if (currentFeatureCoordinates !== featureCoordinates) {
        currentFeatureCoordinates = featureCoordinates;

        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const location = e.features[0].properties.Location;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(e.lngLat).setHTML(`
          <div class="popup">
            <div class="popup-route">${location}</div>`).addTo(map);
      }
    });

    map.on('mouseleave', 'stops-2025-layer', () => {
      currentFeatureCoordinates = undefined;
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    map.on('mousemove', 'stops-2019-layer', (e) => {
      const featureCoordinates = e.features[0].geometry.coordinates.toString();
      if (currentFeatureCoordinates !== featureCoordinates) {
        currentFeatureCoordinates = featureCoordinates;

        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const location = e.features[0].properties.Location;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(e.lngLat).setHTML(`
          <div class="popup">
            <div class="popup-route">${location}</div>`).addTo(map);
      }
    });

    map.on('mouseleave', 'stops-2019-layer', () => {
      currentFeatureCoordinates = undefined;
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    map.on('mousemove', 'stops-2016-layer', (e) => {
      const featureCoordinates = e.features[0].geometry.coordinates.toString();
      if (currentFeatureCoordinates !== featureCoordinates) {
        currentFeatureCoordinates = featureCoordinates;

        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const location = e.features[0].properties.Location;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(e.lngLat).setHTML(`
          <div class="popup">
            <div class="popup-route">${location}</div>
            <div class="popup-date">${2016}</div>`).addTo(map);
      }
    });

    map.on('mouseleave', 'stops-2016-layer', () => {
      currentFeatureCoordinates = undefined;
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    // ***** ROUTES HOVER ABLES **** //

    map.on('mousemove', 'route-2025-layer', (e) => {
      map.getCanvas().style.cursor = 'pointer';

      const { Route, Date, Dist_mi } = e.features[0].properties;
      
      const routeColor = '#DC4633';
      
      const formattedDist = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0
      }).format(Dist_mi);

      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="popup">
            <div class="popup-route">${Route}</div>
            <div class="popup-date">${Date} ${2025}</div>
            <div class="popup-dist" style="color: ${routeColor}">
              <span class="popup-dist-number">${formattedDist}</span>
              <span class="popup-dist-unit"> miles</span>
            </div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseleave', 'route-2025-layer', () => {
      currentFeatureCoordinates = undefined;
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    map.on('mousemove', 'route-2019-layer', (e) => {
      map.getCanvas().style.cursor = 'pointer';

      const { Route, Date, Dist_mi } = e.features[0].properties;
      
      const routeColor = '#00A189';
      
      const formattedDist = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0
      }).format(Dist_mi);

      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="popup">
            <div class="popup-route">${Route}</div>
            <div class="popup-date">${Date} ${2019}</div>
            <div class="popup-dist" style="color: ${routeColor}">
              <span class="popup-dist-number">${formattedDist}</span>
              <span class="popup-dist-unit"> miles</span>
            </div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseleave', 'route-2019-layer', () => {
      currentFeatureCoordinates = undefined;
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    // map.on('mousemove', 'route-2016-layer', (e) => {
    //   map.getCanvas().style.cursor = 'pointer';

    //   const { Route, Date, Dist_mi } = e.features[0].properties;
      
    //   const routeColor = '#1E3765';
      
    //   const formattedDist = new Intl.NumberFormat('en-US', {
    //     maximumFractionDigits: 0
    //   }).format(Dist_mi);

    //   popup
    //     .setLngLat(e.lngLat)
    //     .setHTML(`
    //       <div class="popup">
    //         <div class="popup-route">${Route}</div>
    //         <div class="popup-date">${Date}</div>
    //         <div class="popup-dist" style="color: ${routeColor}">
    //           <span class="popup-dist-number">${formattedDist}</span>
    //           <span class="popup-dist-unit"> miles</span>
    //         </div>
    //       </div>
    //     `)
    //     .addTo(map);
    // });

    // map.on('mouseleave', 'route-2016-layer', () => {
    //   currentFeatureCoordinates = undefined;
    //   map.getCanvas().style.cursor = '';
    //   popup.remove();
    // });

  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

</script>

<div class="map-wrap">
  <div class="map" bind:this={mapContainer}></div>

  <div class="map-overlay">
      <div class="map-ui">
        <button class:active={show2025} style="--year-color: {YEAR_COLORS[2025]}" on:click={toggle2025UI}>2025</button>
        <button class:active={show2019} style="--year-color: {YEAR_COLORS[2019]}" on:click={toggle2019UI}>2019</button>
        <button class:active={show2016} style="--year-color: {YEAR_COLORS[2016]}" on:click={toggle2016UI}>2016</button>
      </div>
  </div>

  <div class="map-overlay desktop-only">
    <div class="map-ui">
        <button class:active={show2025} style="--year-color: {YEAR_COLORS[2025]}" on:click={toggle2025UI}>2025</button>
        <button class:active={show2019} style="--year-color: {YEAR_COLORS[2019]}" on:click={toggle2019UI}>2019</button>
        <button class:active={show2016} style="--year-color: {YEAR_COLORS[2016]}" on:click={toggle2016UI}>2016</button>
      </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-number" style="color: {statColor}">{totalMiles.toLocaleString()}</div>
        <div class="stat-label">total miles</div>
      </div>
      <div class="stat">
        <div class="stat-number" style="color: {statColor}">{totalDays}</div>
        <div class="stat-label">days</div>
      </div>
      <div class="stat">
        <div class="stat-number" style="color: {statColor}">{totalStates}</div>
        <div class="stat-label">states</div>
      </div>
    </div>
  </div>
  
</div>

<!-- // ***** MOBILE STATS **** // -->
<div class="stats mobile-only">
  <div class="stat">
    <div class="stat-number" style="color: {statColor}">{totalMiles.toLocaleString()}</div>
    <div class="stat-label">total miles</div>
  </div>
  <div class="stat">
    <div class="stat-number" style="color: {statColor}">{totalDays}</div>
    <div class="stat-label">days</div>
  </div>
  <div class="stat">
    <div class="stat-number" style="color: {statColor}">{totalStates}</div>
    <div class="stat-label">states</div>
  </div>
</div>

<style>
  .map-wrap {
    position: relative;
    width: 100%;
    height: 600px;
  }

  .map {
    position: absolute;
    inset: 0;
  }
</style>
