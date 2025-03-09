import { useEffect, useState } from "react";
import { onValue, push, ref, set } from "firebase/database";

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

export const useData = (path) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();

  useEffect(() => {
    const dbRef = ref(database, path); // Listen to the <path> node

    // Listen for changes
    const unsubscribe = onValue(dbRef, (snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        setData(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [path]);

  return { data, loading };
};
