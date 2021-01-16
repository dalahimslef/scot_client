<template>
  <div>
    <v-navigation-drawer permanent>
      <v-list dense nav>
        <DialogOpener
          :icon="'mdi-home'"
          :title="'Type'"
          :subtitle="'House'"
          v-model="type_dialog"
          @dialog-opened="openSettingsDialog"
        />
        <DialogOpener
          :icon="'mdi-currency-btc'"
          :title="'Price (NOK)'"
          :subtitle="price_range[0] + ' - ' + price_range[1]"
          v-model="price_range_dialog"
          @dialog-opened="openSettingsDialog"
        />
        <DialogOpener
          :icon="'mdi-format-page-break'"
          :title="'House size (m2)'"
          :subtitle="sqm_range[0] + ' - ' + sqm_range[1]"
          v-model="sqm_range_dialog"
          @dialog-opened="openSettingsDialog"
        />
        <DialogOpener
          :icon="'mdi-pine-tree'"
          :title="'Plot size (mål)'"
          :subtitle="plot_size_range[0] + ' - ' + plot_size_range[1]"
          v-model="plot_size_range_dialog"
          @dialog-opened="openSettingsDialog"
        />
      </v-list>
    </v-navigation-drawer>

    <div id="map" style="height: 100%"></div>

    <FormDialog
      :header="'Property type'"
      v-model="type_dialog"
      @save_setting="saveSettings"
    >
      <v-range-slider
        label="NOK"
        v-model="value"
        value="30"
        thumb-label="always"
      ></v-range-slider>
    </FormDialog>

    <FormDialog
      :header="'Price'"
      v-model="price_range_dialog"
      @save_setting="saveSettings"
    >
      <v-range-slider
        label="NOK"
        v-model="price_range_temp"
        :min="price_range_min"
        :max="price_range_max"
        thumb-label="always"
      ></v-range-slider>
    </FormDialog>

    <FormDialog
      :header="'Size'"
      v-model="sqm_range_dialog"
      @save_setting="saveSettings"
    >
      <v-range-slider
        label="m2"
        v-model="sqm_range_temp"
        :min="sqm_range_min"
        :max="sqm_range_max"
        thumb-label="always"
      ></v-range-slider>
    </FormDialog>

    <FormDialog
      :header="'Plot size'"
      v-model="plot_size_range_dialog"
      @save_setting="saveSettings"
    >
      <v-range-slider
        label="Acres"
        v-model="plot_size_range_temp"
        :min="plot_size_range_min"
        :max="plot_size_range_max"
        thumb-label="always"
      ></v-range-slider>
    </FormDialog>
  </div>
</template>

<script>
// import { initGoogleMaps } from "../utils/gmaps.js";
import axios from "axios";
import MarkerClusterer from "@googlemaps/markerclustererplus";

import DialogOpener from "./components/Map/DialogOpener";
import FormDialog from "./components/Map/FormDialog";

export default {
  name: "Map",
  components: {
    DialogOpener,
    FormDialog,
  },
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
      type_dialog: false,
      type: "house",

      price_range_dialog: false,
      price_range_min: 0,
      price_range_max: 10000000,
      price_range_temp: [200000, 500000],
      price_range: [200000, 500000],

      sqm_range_dialog: false,
      sqm_range_min: 0,
      sqm_range_max: 1000,
      sqm_range_temp: [500, 600],
      sqm_range: [500, 600],

      plot_size_range_dialog: false,
      plot_size_range_min: 0,
      plot_size_range_max: 10,
      plot_size_range_temp: [2, 10],
      plot_size_range: [2, 10],
    };
  },
  props: ["value"],
  methods: {
    openSettingsDialog: function () {
      this.price_range_temp = this.price_range;
      this.sqm_range_temp = this.sqm_range;
      this.plot_size_range_temp = this.plot_size_range;
    },
    saveSettings: function () {
      this.price_range = this.price_range_temp;
      this.sqm_range = this.sqm_range_temp;
      this.plot_size_range = this.plot_size_range_temp;
    },
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

