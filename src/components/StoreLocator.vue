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
import firebase from "firebase";
import { firebaseConfig } from "@/conf.js";
import axios from "axios";
import toastr from "toastr";

export default {
  data() {
    return {
      mapConfig: mapConfig,
      markers: [],
      apiKey: apiKey
    };
  },
  computed: {
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
          reportedBy: eventResult.event.reportedBy.username,
          reportedAt: eventResult.event.timeReported
        });
      }, []);

      console.log("Got events... " + events.length);
    },
    async init() {

      console.log("In init...");
      const store = this;
      
      navigator.serviceWorker.register('/../firebase-messaging-sw.js').then(function(registration) {
        console.log("Yes serviceWorker.register worked..." + registration);
              
        navigator.serviceWorker.ready.then(function() {
          firebase.initializeApp(firebaseConfig);
          
          const messaging = firebase.messaging();
          messaging.usePublicVapidKey('BPJ1zP6OWdD4Q5Ua7qszJByj38Yp6WyrXuNAtsWBZJ6Hiq9O2yBKGTroRfM3w5anTzDwfol8_3HiniFwREvjoHI');
          messaging.useServiceWorker(registration);

          console.log("Calling requestPermission()...");

          try {
            messaging.requestPermission();
          } catch (e) {
            console.log('Unable to get permission', e);
            return;
          }

          navigator.serviceWorker.addEventListener('message', event => {
            console.log("Yes serviceWorker.addEventListener() called..." + event);
            if (event.data.type &&  event.data.type === 'event') {
              store.showData(event.data);
            }
          });

          console.log("Calling getToken()...");

          messaging.getToken().then(function(currentToken) {
            console.log("Registering with token : " + currentToken);
            axios.get(`/api/register?token=` + currentToken)
              .then(response => { 
                console.log("Registered token....");
              })
              .catch(e => {
                console.log("Register token failed.... " + e);
              })
                  
            messaging.onTokenRefresh(async () => {
              console.log('token refreshed');
              messaging.getToken().then(function(currentToken){
                axios.get(`/api/register?token=` + currentToken)
                .then(response => { 
                  console.log("Registered token....");
                })
                .catch(e => {
                  console.log("Register token failed.... " + e);
                })
              });
            });  
          });
        });
      }).catch(function(error) {
        console.log("Error : " + error);
      });
    
    },
    async showData(data) {

      toastr.error('New Event Detected...', 'Alert', {positionClass: "toast-bottom-right"})

      //const table = document.getElementById('outTable');
      //const html = [];
      //html.push(`<div><div class="header">${data.type}</div><div class="joke">${data.Chris}</div></div>`);
      //table.innerHTML = html.join('');
    },
  },
  mounted() {
    this.$root.$on('eventData', data => {
        this.displayEvents(data);
    });

    this.init();
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



