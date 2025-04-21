import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  const baseURL = import.meta.env.VITE_API_BASE_URL || "https://td-backend-mh4l.onrender.com";

  const addTask = async () => {
    if (task.trim() === "") return;
    try {
      const response = await axios.post(`${baseURL}/api/todos/`, {
        title: task,
        description: description,
        completed: false
      });
      console.log('Add task response:', response.data);
      setTodos([...todos, response.data]);
      setTask("");
      setDescription("");
    } catch (err) {
      console.error('Add task error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || "Failed to add task. Please check the console for details.");
    }
  };

  const removeTask = async (id) => {
    try {
      await axios.delete(`${baseURL}/api/todos/${id}/`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const toggleComplete = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      const response = await axios.put(`${baseURL}/api/todos/${id}/`, {
        ...todo,
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
    setEditDescription(todo.description || "");
  };

  const saveEdit = async (id) => {
    try {
      const response = await axios.put(`${baseURL}/api/todos/${id}/`, {
        title: editText,
        description: editDescription,
        completed: todos.find(t => t.id === id).completed
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

  useEffect(() => {
    console.log('Fetching todos from:', `${baseURL}/api/todos/`);

    axios.get(`${baseURL}/api/todos/`)
      .then(response => {
        console.log('Todos fetched:', response.data);
        setTodos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching todos:', error);
        setError("Failed to load todos");
        setLoading(false);
      });
  }, [baseURL]);

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
          <textarea
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
                <strong>{todo.title}</strong>
                {todo.description && <p className="task-description">{todo.description}</p>}
              </div>
              <div className="task-actions">
                {editIndex === todo.id ? (
                  <div className="edit-form">
                    <div className="edit-inputs">
                      <input
                        type="text"
                        placeholder="Edit task title..."
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <textarea
                        placeholder="Edit description..."
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="edit-actions">
                      <button className="save-btn" onClick={() => saveEdit(todo.id)}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditIndex(null)}>Cancel</button>
                    </div>
                  </div>
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
