<template>
  <div></div>
</template>
<script>
import { mapState } from "vuex";

export default {
  props: {
    google: Object,
    map: Object,
    position: Object
  },
  computed: {
    ...mapState({
      storeId: state => state.stores.selectedStoreId
    })
  },
  watch: {
    storeId: function(val) {
      if (val === this.position.storeId) {
        this.infowindow.open(this.map, this.marker);
        //this.marker.setAnimation(this.google.maps.Animation.BOUNCE);
      } else {
        this.infowindow.close();
        this.marker.setAnimation(null);
      }
    }
  },
  methods: {
    selectStore() {
      this.$store.dispatch({
        type: "stores/selectStore",
        id: this.position.storeId
      });
      // caso se è già selezionato nel vuex stato
      this.infowindow.open(this.map, this.marker);
    }
  },
  mounted() {
    const { Marker } = this.google.maps;
    const { InfoWindow } = this.google.maps;
    const self = this;
    const marker = new Marker({
      position: this.position,
      map: this.map,
      title: this.position.markerName
    });
    const infowindow = new InfoWindow({
      content: "<div><b>" + this.position.markerName + " (" + this.position.id + ")</b></div><div>Reported By " + this.position.reportedBy + "</div><div>" + new Date(this.position.reportedAt*1000).toLocaleString() + "</div>"
    });
    this.infowindow = infowindow;
    this.marker = marker;
    marker.addListener("click", function() {
      infowindow.open(this.map, marker);
      //this.marker.setAnimation(this.google.maps.Animation.BOUNCE);
    });

    this.$root.$on('eventSelected', data => {
      if (data.id === this.position.id) {
        this.infowindow.open(this.map, this.marker);
        //this.marker.setAnimation(this.google.maps.Animation.BOUNCE);
      } else {
        this.infowindow.close();
        //this.marker.setAnimation(null);
      }
    });
  },
  beforeDestroy() {
    console.log("Yes marker being destroyed...");
    this.marker.setMap(null);
  }
};
</script>
