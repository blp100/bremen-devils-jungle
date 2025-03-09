import { push, ref, set } from "firebase/database";

import { database } from "../firebaseConfig";

// Write Data to Firebase
export const writeData = (path, data) => {
  set(ref(database, path), data)
    .then(() => console.log("Data written successfully"))
    .catch((error) => console.error("Error writing data:", error));
};

// Add Data with Auto-Generated ID
export const addData = (path, data) => {
  const newRef = push(ref(database, path));
  set(newRef, data)
    .then(() => console.log("Data added successfully"))
    .catch((error) => console.error("Error adding data:", error));
};
