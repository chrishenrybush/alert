<template>
  <div class="stores">
    <select @change="selectEventTypeId" v-model="selectedEventType" class="stores_countries">
      <option
        v-for="eventType in eventTypes"
        :key="eventType"
        :value="eventType"
      >{{ eventType }}</option>
    </select>
    <div>
      <input class="stores_search" type="number" placeholder="Latitude" v-model="latitude">
      <input class="stores_search" type="number" placeholder="Longitude" v-model="longitude">
      <label>Radius of search</label>
      <input class="stores_search" type="number" placeholder="Radius (km)" v-model="radius">
      <label>Period</label>
      <input class="stores_search" type="number" placeholder="Period until now (Hours)" v-model="hours">
      <button @click="queryEvents()" class="stores_search" >Retrieve Events</button>
      <input class="stores_search" type="text" placeholder="filter" v-model="keyword">
      <div id="outTable"></div>
      <ul class="stores_list">
        <li
          v-if="filteredEvents.length === 0"
          class="stores_list_store stores_list_store--empty"
        >No Results</li>
        <li
          v-else
          v-for="eventResult in filteredEvents"
          :data-storeid="eventResult.event.id"
          :key="eventResult.event.id"
          v-on:click="selectEvent(eventResult.event)"
          class="stores_list_store"
        >
          <span class="stores_list_store_name">{{ eventResult.event.type }} ({{eventResult.event.id}})</span>
          <span>Long: {{eventResult.event.location.longitude}} Lat: {{eventResult.event.location.latitude}} </span>
          <span>Reported at: {{ eventResult.event.timeReported | formatepoch }}</span>
          <span>Reported by : {{ eventResult.event.reportedBy.firstName + " " +  eventResult.event.reportedBy.lastName }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
//import * as R from "ramda";
import axios from 'axios';

export default {
  data() {
    return {
      keyword: "",
      latitude: null,
      longitude: null,
      radius: null,
      hours: null,
      selectedEventType: null,
      eventTypes: [],
      eventResults: [],
      eventQueryParams: {
          devicesInRadius: 1.0,
          locationQualifier: {
            latitude: 50.85546672,
            longitude: -4.63293723,
            radius: 1.0,
            cityName: null
          },
          timeQualifier: {
            periodOfInterest: "PT2400H",
            startTime: null,
            endTime: null
          },
          eventTypeList: ["KnifeAttack"]
        }
    };
  },
  computed: {
    ...mapState({
      stores: state => state.stores.all,
      pending: state => state.stores.pending,
      error: state => state.stores.error
    }),
    filteredEvents() {
      /** const keywordInLowerCase = R.toLower(this.keyword);
      const hasKeywordInTitle = R.includes(keywordInLowerCase);
      const storeName = R.prop("event.id");
      const filterByKeyword = R.filter(
        R.compose(
          hasKeywordInTitle,
          R.toLower,
          storeName
        )
      );
      return filterByKeyword(this.eventResults);
      ***/
     return this.eventResults;
    }
  },
  methods: {
    selectEvent(event) {
      this.$root.$emit('eventSelected', event);
      //this.$store.dispatch({
      //  type: "stores/selectEvent",
      //  id: clickedId
      //});
    },
    selectEventTypeId() {
      //this.$store.dispatch({
      //  type: "stores/selectEventTypeId",
      //  id: +this.eventTypeId
      //});
    },
    queryEvents() {

      this.eventQueryParams.locationQualifier.latitude = this.latitude;
      this.eventQueryParams.locationQualifier.longitude = this.longitude;
      this.eventQueryParams.locationQualifier.radius = this.radius * 1000.0;
      this.eventQueryParams.eventTypeList = [ this.selectedEventType ];
      this.eventQueryParams.timeQualifier.periodOfInterest = "PT" + this.hours + "H";
      axios.post(`/api/eventquery`,  this.eventQueryParams )
        .then(response => { 
          console.log("Yes...." + JSON.stringify(response.data) );
          this.eventResults = response.data;
          this.$root.$emit('eventData', response.data);
        })
        .catch(e => {
          console.log("Oh no.... " + e);
        })
    }
  },
  filters: {
    formatepoch: function (value) {
      if (!value) return ''
      var d = new Date(value*1000); // The 0 there is the key, which sets the date to the epoch
      //d.setUTCSeconds(value);
      return d.toLocaleString();
    }
  }, 
  created() {
    //this.$store.dispatch("stores/getEventTypes");

    console.log("Yes got here....");

    this.$root.$on('mapLocationClicked', data => {
        this.latitude = data.latitude;
        this.longitude = data.longitude;
    });

    axios.get("/api/eventTypes")
      .then(response => {
        console.log("Yes...." + JSON.stringify(response.data));
        this.eventTypes = response.data;
      })
      .catch(e => {
        console.log("Oh no.... " + e);
      });
  }
};
</script>

<style lang="scss">
.stores {
  &_search {
    margin-top: 2px;
    box-sizing: border-box;
    border: 1px solid black;
    width: 100%;
    height: 36px;
    font-size: 18px;
    border-bottom: 0;
    text-indent: 8px;
    &::placeholder {
      font-size: 14px;
    }
  }
  &_countries {
    width: 100%;
    height: 60px;
  }
  &_list {
    border-top: 1px solid black;
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
    &_store {
      display: flex;
      flex-direction: column;
      border: 1px solid black;
      border-top: none;
      padding: 4px;
      cursor: pointer;
      &--empty {
        background-color: lightsalmon;
      }
      &:hover {
        background-color: lightgreen;
      }
      &:active {
        background-color: lightcoral;
      }
      &_name {
        font-weight: bold;
      }
    }
  }
}
</style>
