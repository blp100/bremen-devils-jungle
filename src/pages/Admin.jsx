import { useData, writeData } from "../utils/firebaseHelpers";

const Admin = () => {
  const { data } = useData();
  return (
    <div>
      <h1>Admin Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <button
        onClick={() => writeData("messages", { text: "Hello, Firebase!" })}
      >
        Write Data
      </button>
      <button
        onClick={() =>
          writeData("messages", { "job description": "Best Frontend" })
        }
      >
        Write the Job Description
      </button>

      <button
        onClick={() => writeData("messages/job description", "Best Frontend!!")}
      >
        Partial Update
      </button>
    </div>
  );
};

export default Admin;
