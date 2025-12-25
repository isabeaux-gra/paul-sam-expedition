import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import * as maptilersdk from '@maptiler/sdk';


const app = mount(App, {
  target: document.getElementById('app'),
})

maptilersdk.config.apiKey = '66rTvTjbUbMnniaYtYPI';
// const map = new maptilersdk.Map({
//   container: mapContainer, // container's id or the HTML element to render the map
//   style: maptilersdk.MapStyle.LANDSCAPE,
//   center: [-98, 39], // starting position [lng, lat]
//   zoom: 3.5, // starting zoom
// });



export default app
