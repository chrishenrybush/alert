/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/5.8.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.8.2/firebase-messaging.js");

console.log("In firebase-messaging-sw.....");

firebase.initializeApp({
  messagingSenderId: "1041100581071"
});

const messaging = firebase.messaging();

//messaging.onMessage(function(payload) {
//  console.log("Message received. ", payload);
// ...
//});

self.addEventListener("push", async event => {
  console.log("In addEventListener().....");

  //const db = await getDb();
  //const tx = this.db.transaction("jokes", "readwrite");
  //const store = tx.objectStore("jokes");

  console.log("json=" + event.data.json().data);
  const data = event.data.json().data;
  //data.id = parseInt(data.id);
  //data.id = 1;
  //store.put(data);
  data.type = "event";

  const allClients = await self.clients.matchAll({
    includeUncontrolled: true
  });
  for (const client of allClients) {
    client.postMessage(data);
  }
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

messaging.setBackgroundMessageHandler(function(payload) {
  console.log("In setBackgroundMessageHandler()....." + payload);

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
