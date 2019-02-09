import * as R from "ramda";
import places from "../../../data/alexandermcqueen";
import router from "@/router";
import axios from "axios";

const state = {
  all: [],
  pending: false,
  error: false,
  selectedStoreId: 0,
  eventTypes: [],
  selectedEventTypeId: 0,
  path: "/stores-map-vue/store-locator",
  mapLoaded: false
};

const getters = {
  getSelectedStore: state => {
    const selectStoreFromId = post => post.ID === +state.selectedStoreId;
    const selectStore = pred => R.filter(pred);
    const getStore = selectStore(selectStoreFromId);
    return R.head(getStore(state.all));
  },
  getSelectedEventType: state => {
    return state.eventTypes[state.selectedEventTypeId];
  }
};

const actions = {
  getEventTypes({ commit }) {
    commit("apiPending");

    axios.get("/api/eventTypes")
      .then(response => {
        console.log("Yes...." + JSON.stringify(response.data));
        commit("receiveEventTypes", response.data);
      })
      .catch(e => {
        console.log("Oh no.... " + e);
      });
  },
  getAllStores({ commit }) {
    commit("apiPending");

    commit(
      "receiveAll",
      places.sort((a, b) => (a.post_title < b.post_title ? -1 : 1)) // stink
    );
    // return fetch("../../../data/store-locator.json")
    //   .then(r => r.json())
    //   .then(json => {
    //     commit("receiveAll", json);
    //   })
    //   .catch(e => {
    //     commit("apiFailure", e);
    //   });
  },
  selectStore({ commit }, { id }) {
    commit("selectStore", id);
  },
  selectEventTypeId({ commit }, { id }) {
    commit("selectedEventTypeId", id);
  },
  mapLoaded({ commit }) {
    commit("mapLoaded");
  }
};

const mutations = {
  selectEventTypeId(state, term_id) {
    state.selectedEventTypeId = term_id;
  },
  receiveEventTypes(state, types) {
    state.pending = false;
    state.eventTypes = types;
  },
  receiveAll(state, stores) {
    state.pending = false;
    state.all = stores;
  },
  apiPending(state) {
    state.pending = true;
  },
  apiFailure(state) {
    state.pending = false;
    state.error = true;
  },
  selectStore(state, id) {
    state.selectedStoreId = id;
    state.path = `/store-locator/${state.selectedStoreId}`;
    router.push(state.path);
  },
  mapLoaded(state) {
    state.mapLoaded = true;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
