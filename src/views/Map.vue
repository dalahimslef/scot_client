<template>
  <div>
    <h3>My Google Maps Demo</h3>
    <div id="map" style="height: 300px"></div>
    <v-text-field v-model="address" label="Adress" outlined></v-text-field>
    <v-btn color="primary" @click="getLocation"> Get location </v-btn>
  </div>
</template>

<script>
import { initGoogleMaps } from "../utils/gmaps.js";
import axios from "axios";
import MarkerClusterer from '@googlemaps/markerclustererplus';

export default {
  name: "HelloWorld",
  data: function () {
    return {
      ggl: undefined,
      map: undefined,
      address: "",
      properties: undefined,
    };
  },
  props: {
    msg: String,
    google_map: null,
  },
  methods: {
    getLocation: function () {
      alert("getLocation");
    },
    loadProperties: async function () {
      const resp = await axios.get("http://localhost:3000/properties");
      if (resp.data) {
        this.properties = resp.data;
        console.log(this.properties);

        const markers = this.properties.map((property) => {
          return new this.ggl.maps.Marker({
            position: {
              lat: property.google_latitude,
              lng: property.google_longitude,
            },
            label: property.formattedAdress,
          });
        });
        // Add a marker clusterer to manage the markers.
        new MarkerClusterer(this.map, markers, {
          imagePath:
            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        });
      }
    },
  },
  mounted: async function () {
    try {
      this.ggl = await initGoogleMaps();

      // The location of Uluru
      var uluru = { lat: -25.344, lng: 131.036 };
      // The map, centered at Uluru
      this.map = new this.ggl.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: uluru,
      });
      // The marker, positioned at Uluru
      // new this.ggl.maps.Marker({ position: uluru, map: map });

      this.loadProperties();
    } catch (error) {
      // eslint-disable-next-line no-debugger
      console.error(error);
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

