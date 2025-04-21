import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'

const BASE_URL = "https://backend-fapi.onrender.com/docs";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [task, setTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/todos`);
      setTodos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError("Failed to load todos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTask = async () => {
    if (task.trim() === "") return;
    try {
      const response = await axios.post(`${BASE_URL}/todos`, {
        title: task
      });
      setTodos([...todos, response.data]);
      setTask("");
    } catch (err) {
      console.error('Add task error:', err);
      setError("Failed to add task.");
    }
  };

  const removeTask = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const toggleComplete = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      const response = await axios.put(`${BASE_URL}/todos/${id}`, {
        title: todo.title,
        completed: !todo.completed
      });
      setTodos(todos.map(t => t.id === id ? response.data : t));
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const startEdit = (id) => {
    const todo = todos.find(t => t.id === id);
    setEditIndex(id);
    setEditText(todo.title);
  };

  const saveEdit = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      const response = await axios.put(`${BASE_URL}/todos/${id}`, {
        title: editText,
        completed: todo.completed
      });
      setTodos(todos.map(t => t.id === id ? response.data : t));
      setEditIndex(null);
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const filterTasks = () => {
    if (filter === "completed") return todos.filter((t) => t.completed);
    if (filter === "pending") return todos.filter((t) => !t.completed);
    return todos;
  };

  return (
    <div>
      <h1>My Todo List</h1>

      {loading && <p>Loading...</p>}
      {error && (
        <p style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee' }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: '10px' }}
          >
            ✖
          </button>
        </p>
      )}

      <div className="app-container">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
        <h2>Manage Your Tasks</h2>
        <div className="task-input-container">
          <div className="input-group">
            <input
              type="text"
              placeholder="Add a new task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>
          <button className="add-task-btn" onClick={addTask}>Add Task</button>
        </div>
        <div className="filters">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("completed")}>Completed</button>
          <button onClick={() => setFilter("pending")}>Pending</button>
        </div>
        <ul className="task-list">
          {filterTasks().map((todo) => (
            <li key={todo.id} className={`task-card ${todo.completed ? "completed" : ""}`}>
              <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo.id)} />
              <div className="task-content">
                {editIndex === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <strong>{todo.title}</strong>
                )}
              </div>
              <div className="task-actions">
                {editIndex === todo.id ? (
                  <>
                    <button className="save-btn" onClick={() => saveEdit(todo.id)}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditIndex(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => startEdit(todo.id)}>✏️</button>
                    <button className="delete-btn" onClick={() => removeTask(todo.id)}>🗑️</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
