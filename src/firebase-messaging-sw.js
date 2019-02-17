import firebase from "firebase";

import { firebaseConfig } from "@/conf.js";

console.log("In Firebase service worker...");

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

console.log("Got past firebase Init......");

self.addEventListener("push", async event => {
  const db = await getDb();
  const tx = this.db.transaction("jokes", "readwrite");
  const store = tx.objectStore("jokes");

  const data = event.data.json().data;
  data.id = parseInt(data.id);
  store.put(data);

  tx.oncomplete = async e => {
    const allClients = await self.clients.matchAll({
      includeUncontrolled: true
    });
    for (const client of allClients) {
      client.postMessage("newData");
    }
  };
});

async function getDb() {
  if (this.db) {
    return Promise.resolve(this.db);
  }

  return new Promise(resolve => {
    const openRequest = indexedDB.open("Chuck", 1);

    openRequest.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore("jokes", { keyPath: "id" });
    };

    openRequest.onsuccess = event => {
      this.db = event.target.result;
      resolve(this.db);
    };
  });
}

messaging.setBackgroundMessageHandler(function (payload) {
  const notificationTitle = "Background Title (client)";
  const notificationOptions = {
    body: "Background Body (client)",
    icon: "/mail.png"
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
