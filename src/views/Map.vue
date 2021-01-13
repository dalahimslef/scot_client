<template>
  <div>
    <v-navigation-drawer permanent>
      <!--v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title"> Application </v-list-item-title>
          <v-list-item-subtitle> subtext </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider-->

      <v-list dense nav>
        <v-list-item link @click.stop="dialog = true">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Type</v-list-item-title>
            <v-list-item-subtitle>House</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link>
          <v-list-item-icon>
            <v-icon>mdi-currency-btc</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Price (NOK)</v-list-item-title>
            <v-list-item-subtitle>0 - 10,000,000</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link>
          <v-list-item-icon>
            <v-icon>mdi-format-page-break</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>House size (m2)</v-list-item-title>
            <v-list-item-subtitle>0 - 1000</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link>
          <v-list-item-icon>
            <v-icon>mdi-pine-tree</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Plot size (mål)</v-list-item-title>
            <v-list-item-subtitle>0 - 10</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <!--v-list-item v-for="item in items" :key="item.title" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item-->
      </v-list>
    </v-navigation-drawer>

    <div id="map" style="height: 100%"></div>

    <template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Price range</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid style="padding-top:50px;">
    <v-row>
      <v-col cols="12">
        <v-range-slider
        label="NOK"
          v-model="value"
          value="30"
      thumb-label="always"
        ></v-range-slider>
      </v-col>
    </v-row>
  </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
  </div>

  
</template>

<script>
// import { initGoogleMaps } from "../utils/gmaps.js";
import axios from "axios";
import MarkerClusterer from "@googlemaps/markerclustererplus";

export default {
  name: "HelloWorld",
  data: function () {
    return {
      ggl: undefined,
      map: undefined,
      address: "",
      properties: undefined,
      items: [
        { title: "Dashboard", icon: "mdi-view-dashboard" },
        { title: "Photos", icon: "mdi-image" },
        { title: "About", icon: "mdi-help-box" },
      ],
      right: null,
      dialog:false,
    };
  },
  props: {
    msg: String,
    google_map: null,
  },
  methods: {
    getBounds: function () {
      const bounds = {
        ne: { lat: 200, lng: 200 },
        sw: { lat: -200, lng: -200 },
      };
      const mapBounds = this.map.getBounds();
      if (mapBounds) {
        bounds.ne.lat = mapBounds.getNorthEast().lat();
        bounds.ne.lng = mapBounds.getNorthEast().lng();
        bounds.sw.lat = mapBounds.getSouthWest().lat();
        bounds.sw.lng = mapBounds.getSouthWest().lng();
      }
      return bounds;
    },
    handleBoundsChanged: async function () {
      const bounds = this.getBounds();
      this.getPropertiyCount(bounds);
      this.loadProperties(bounds);
    },
    getPropertiyCount: async function (bounds) {
      const resp = await axios.get(
        "http://localhost:3000/api/properties/count?ne_lat=" +
          bounds.ne.lat +
          "&ne_lng=" +
          bounds.ne.lng +
          "&sw_lat=" +
          bounds.sw.lat +
          "&sw_lng=" +
          bounds.sw.lng
      );
      if (resp.data) {
        console.log(resp.data);
      }
    },
    loadProperties: async function (bounds) {
      const resp = await axios.get(
        "http://localhost:3000/api/properties?ne_lat=" +
          bounds.ne.lat +
          "&ne_lng=" +
          bounds.ne.lng +
          "&sw_lat=" +
          bounds.sw.lat +
          "&sw_lng=" +
          bounds.sw.lng
      );
      if (resp.data) {
        this.properties = resp.data;

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
    /*
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
      //debugger;// eslint-disable-line no-debugger
      // console.log(this.map.getBounds());//

      this.ggl.maps.event.addListener(
        this.map,
        "bounds_changed",
        this.handleBoundsChanged
      );
    } catch (error) {
      // eslint-disable-next-line no-debugger
      console.error(error);
    }
    */
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

