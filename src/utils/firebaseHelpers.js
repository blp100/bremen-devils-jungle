import { useEffect, useState } from "react";
import { onValue, ref, set, update } from "firebase/database";

import { database } from "../firebaseConfig";

export const setData = async (path, data) => {
  try {
    await set(ref(database, path), data);
    return console.log("Data set successfully");
  } catch (error) {
    return console.error("Error setting data:", error);
  }
};

export const updateData = async (path, data) => {
  try {
    await update(ref(database, path), data);
    return console.log("Data updated successfully");
  } catch (error) {
    return console.error("Error updating data:", error);
  }
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
