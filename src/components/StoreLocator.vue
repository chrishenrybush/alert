<template>
  <div class="app-container">
    <sidebar>
      <event-selector/>
    </sidebar>
    <map-loader :map-config="mapConfig" :apiKey="apiKey">
      <template slot-scope="scopeProps">
        <div class="markers">
          <child-marker
            v-for="(marker) in markers"
            :key="marker.id"
            :position="marker"
            :google="scopeProps.google"
            :map="scopeProps.map"
          />
        </div>
      </template>
    </map-loader>
  </div>
</template>

<script>
import { mapState } from "vuex";
import MapLoader from "./MapLoader.vue";
import ChildMarker from "./ChildMarker.vue";
import Sidebar from "./Sidebar.vue";
import StoresList from "./StoresList.vue";
import EventSelector from "./EventSelector.vue";
import { mapConfig, apiKey } from "@/conf.js";

export default {
  data() {
    return {
      mapConfig: mapConfig,
      markers: [],
      apiKey: apiKey
    };
  },
  computed: {
    /****
     *  markers() {
      return this.stores.reduce((acc, cur) => {
        return acc.concat({
          lat: parseFloat(cur.lat),
          lng: parseFloat(cur.lng),
          markerName: cur.post_title,
          storeId: cur.ID
        });
      }, []);
    },
          ***/
    ...mapState({
      stores: state => state.stores.all,
      selectedStoreId: state => state.stores.selectedStoreId
    })
  },
  methods: {
    displayEvents(events) {
      this.markers = events.reduce((acc, eventResult) => {
        return acc.concat({
          lat: eventResult.event.location.latitude,
          lng: eventResult.event.location.longitude,
          markerName: eventResult.event.type,
          id: eventResult.event.id,
          reportedBy: eventResult.event.reportedBy.firstName + " " +  eventResult.event.reportedBy.lastName,
          reportedAt: eventResult.event.timeReported
        });
      }, []);

      console.log("Got events... " + events.length);
    }
  },
  mounted() {
    this.$root.$on('eventData', data => {
        this.displayEvents(data);
    });
    //const storeId = this.$route.params.store;
    //storeId &&
    //  this.$store.dispatch({
    //    type: "stores/selectStore",
    //    id: storeId
    //  });
  },
  created() {
    this.$store.dispatch("stores/getAllStores");
  },
  components: {
    MapLoader,
    ChildMarker,
    Sidebar,
    StoresList,
    EventSelector
  }
};
</script>
