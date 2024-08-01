import React, { useReducer, useState } from "react";
import ReactDOM from "react-dom/client";

// Constants for action types
const ADD_TODO = "ADD";
const DELETE_TODO = "DELETE";

// Constants for categories
const categories = [
  "important-&-urgent",
  "important-&-not-urgent",
  "not-important-&-urgent",
  "not-important-&-not-urgent",
];

const initialTodos = [];

// Reducer for managing todo actions
const reducer = (state, action) => {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          id: Date.now(), // Using timestamp for unique IDs
          title: action.title,
          category: action.category,
        },
      ];
    case DELETE_TODO:
      return state.filter((todo) => todo.id !== action.id);
    case 'SET': // For setting the imported todos
      return action.todos;
    default:
      return state;
  }
};

// TodoItem Component
const TodoItem = ({ todo, onDelete }) => (
  <div style={{ marginBottom: '10px' }}>
    <span>{todo.title}</span>
    <button onClick={() => onDelete(todo)} style={{ marginLeft: '5px' }}>
      Delete
    </button>
  </div>
);

// Todos Component
function Todos() {
  const [todos, dispatch] = useReducer(reducer, initialTodos);
  const [task, setTask] = useState("");
  const [category, setCategory] = useState(categories[0]); // Default to first category

  const handleDelete = (todo) => {
    dispatch({ type: DELETE_TODO, id: todo.id });
  };

  const handleChange = (event) => {
    setTask(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (task.trim()) {
      dispatch({ type: ADD_TODO, title: task, category });
      setTask(""); // Clear the input field
    }
  };

  // Export todos to a file
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(todos, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todos.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import todos from a file
const handleImport = (event) => {
  const file = event.target.files[0];
  const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes

  if (file) {
    // Check the file size
    if (file.size > maxFileSize) {
      alert("File is too large. Please select a file smaller than 5 MB.");
      return; // Exit the function to avoid processing the file further
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTodos = JSON.parse(e.target.result);
        
        dispatch({ type: 'SET', todos: importedTodos });
      } catch (error) {
        alert("Error importing file: " + error.message);
      }
    };
    reader.readAsText(file);
  }
};

  // Group todos by categories
  const categorizedTodos = categories.map((cat) => ({
    category: cat,
    items: todos.filter((todo) => todo.category === cat),
  }));

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your todo:
          <input
            style={{ marginLeft: '5px' }}
            type="text"
            value={task}
            onChange={handleChange}
            required
          />
        </label>
        <label style={{ marginRight: '5px' }}>
          Select category:
          <select
            style={{ marginLeft: '5px' }}
            value={category}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </label>
        <input type="submit" disabled={!task.trim()} /> {/* Submit only if task is non-empty */}
      </form>

      <h2>Todo List</h2>
      {categorizedTodos.map(({ category, items }) => (
        items.length > 0 && (
          <div key={category}>
            <h3>
              {category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </h3>
            {items.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onDelete={handleDelete} />
            ))}
          </div>
        )
      ))}

      <button onClick={handleExport}>Export Todos</button>
      <input 
        type="file" 
        accept=".json" 
        onChange={handleImport} 
        style={{ marginTop: '10px' }} 
      />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Todos />);
