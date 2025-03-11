import { useEffect, useState } from "react";
import { onValue, ref, set, update } from "firebase/database";
import { database } from "../firebaseConfig";

// Generic function to set data
export const setData = async <T>(path: string, data: T): Promise<void> => {
  try {
    await set(ref(database, path), data);
    console.log("Data set successfully");
  } catch (error) {
    console.error("Error setting data:", error);
  }
};

// Generic function to update data
export const updateData = async <T>(
  path: string,
  data: Partial<T>,
): Promise<void> => {
  try {
    await update(ref(database, path), data);
    console.log("Data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

// Hook to fetch and listen for data changes
export const useData = <T>(path?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const dbRef = ref(database, path); // Listen to the <path> node

    // Listen for changes
    const unsubscribe = onValue(dbRef, (snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        setData(snapshot.val() as T);
      } else {
        setData(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [path]);

  return { data, loading };
};
