import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

import { useState, useEffect } from "react";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [task, setTask] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const fetchTask = async (token) => {
    try {
      const response = await fetch("https://todoback-bw1o.onrender.com/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log("Fetched tasks : ", data);
      setTask(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    if (token) fetchTask(token);
  }, [token]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setTask([]);
  };

  const addTask = async (text) => {
    try {
      const response = await fetch("https://todoback-bw1o.onrender.com/tasks", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, status: "pending", priority: "medium" }),
      });
      const newTask = await response.json();
      setTask([...task, newTask]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`https://todoback-bw1o.onrender.com/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTask(task.filter((tas) => tas._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const updateTasksStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "complete" : "pending";
      const response = await fetch(
        `https://todoback-bw1o.onrender.com/tasks/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const updatedTask = await response.json();
      setTask(task.map((tas) => (tas._id === id ? updatedTask : tas)));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const updateTasksPriority = async (id, newPriority) => {
    try {
      const response = await fetch(
        `https://todoback-bw1o.onrender.com/tasks/${id}/priority`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priority: newPriority }),
        }
      );
      const updatedTask = await response.json();
      setTask(task.map((tas) => (tas._id === id ? updatedTask : tas)));
    } catch (err) {
      console.error("Error updating priority:", err);
    }
  };

  const filterTasks = task.filter(
    (tas) =>
      (filterStatus === "all" || tas.status === filterStatus) &&
      (filterPriority === "all" || tas.priority === filterPriority)
  );

  function Mainapp() {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col">
        <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
          <ul className="flex space-x-4">
            <li>
              <span className="px-4 py-2 rounded-full font-semibold transition-colors duration-200 hover:bg-orange-600 hover:text-white focus:outline-none shadow-small">
                Home
              </span>
            </li>
          </ul>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-full font-semibold transition-colors duration-200 hover:bg-orange-600 hover:text-white focus:outline-none shadow-small"
          >
            Log out
          </button>
        </nav>

        <main className="flex-1 p-8">
          <h1 className="text-4xl font-extrabold text-center mb-8 text-orange-600 drop-shadow">
            To Do List
          </h1>
          <form
            className="mb-6 flex gap-2 justify-center"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const text = form.elements[0].value.trim();
              if (text) {
                addTask(text);
                form.reset();
              }
            }}
          >
            <input
              type="text"
              required
              className="p-3 border-2 border-orange-300 rounded-lg w-2/3 focus:outline-none focus:ring-orange-300"
              placeholder="Add a task"
            />
            <button
              type="submit"
              className="bg-orange-500 ml-4 px-4 py-2 rounded-full font-semibold transition-colors duration-200 hover:bg-orange-600 hover:text-white focus:outline-none shadow-small text-white"
            >
              Add
            </button>
          </form>

          <div className="mb-6 flex gap-4 justify-center">
            <select
              className="p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">All status</option>
              <option value="complete">Completed</option>
              <option value="pending">Pending</option>
            </select>

            <select
              className="p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
              onChange={(e) => setFilterPriority(e.target.value)}
              value={filterPriority}
            >
              <option value="all">All priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <ul className="space-y-4">
            {filterTasks.map((tas) => (
              <li
                key={tas._id}
                className="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-center gap-4 hover:bg-orange-100 transition duration-100"
              >
                <div className="flex-1">
                  <span className="text-lg text-orange-800">{tas.text}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({tas.status}, {tas.priority})
                  </span>
                </div>
                <div className="flex gap-2 item-center">
                  <button
                    onClick={() => updateTasksStatus(tas._id, tas.status)}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors duration-300 ${
                      tas.status === "pending"
                        ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                        : "bg-green-400 text-green-900 hover:bg-green-500"
                    }`}
                  >
                    {tas.status === "pending"
                      ? "Mark Complete"
                      : "Mark Pending"}
                  </button>

                  <select
                    className="p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                    onChange={(e) => {
                      updateTasksPriority(tas._id, e.target.value);
                    }}
                    value={tas.priority}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <button
                    onClick={() => deleteTask(tas._id)}
                    title="Delete task"
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-full transition-colors duration-200"
                  >
                    <i className="fas fa-trash" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </main>

        <footer className="bg-orange-500 text-white p-4 mt-auto text-center shadow-inner">
          2025 Your To.Do App
        </footer>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
         element={token ? <Mainapp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}
