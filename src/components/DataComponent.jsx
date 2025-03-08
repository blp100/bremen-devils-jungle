import { useEffect, useState } from "react";
import { database } from "../firebaseConfig.js"
import { ref, onValue } from "firebase/database";
import { writeData } from "../utils/firebaseHelpers";

export default function DataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const dbRef = ref(database, "messages"); // 👈 Listen to the "messages" node

    // Listen for changes
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        setData(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <div>
      <h2>Firebase Realtime Database</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <button
        onClick={() => writeData("messages", { text: "Hello, Firebase!" })}
      >
        Write Data
      </button>
      <button
        onClick={() => writeData("messages", { "job description": "Best Frontend" })}
      >
        Write the Job Description
      </button>
    </div>
  );
}