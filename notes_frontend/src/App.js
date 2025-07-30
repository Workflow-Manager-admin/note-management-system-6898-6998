import React, { useEffect, useState } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  // App-level state and handlers
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState("");
  // Folders/tags mock - could be enhanced with backend
  const [folders] = useState(["All Notes", "Work", "Personal"]);
  const [selectedFolder, setSelectedFolder] = useState("All Notes");

  // Simulate fetching notes from backend (replace with real API in integration)
  useEffect(() => {
    // PUBLIC_INTERFACE
    function fetchNotes() {
      // Placeholder notes
      setNotes([
        {
          id: "1",
          title: "Welcome to Notes!",
          content: "Click 'New Note' to get started.",
          folder: "All Notes",
          updated: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Minimalistic UI",
          content:
            "A minimal, light and responsive layout. Use, edit, or delete notes.",
          folder: "Work",
          updated: new Date().toISOString(),
        },
      ]);
    }
    fetchNotes();
  }, []);

  // PUBLIC_INTERFACE
  function handleSelectNote(noteId) {
    setSelectedNoteId(noteId);
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleCreateNote() {
    setEditingNote({
      id: null,
      title: "",
      content: "",
      folder: selectedFolder === "All Notes" ? "" : selectedFolder,
    });
    setSelectedNoteId(null);
  }

  // PUBLIC_INTERFACE
  function handleEditNote(note) {
    setEditingNote({ ...note });
    setSelectedNoteId(note.id);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(noteId) {
    if (
      window.confirm("Are you sure you want to delete this note? This action cannot be undone.")
    ) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
        setEditingNote(null);
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleSaveNote(note) {
    if (!note.title.trim()) {
      alert("Title must not be empty");
      return;
    }
    if (note.id) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id
            ? { ...note, updated: new Date().toISOString() }
            : n
        )
      );
    } else {
      const newId = Math.random().toString(36).slice(2, 8);
      setNotes((prev) => [
        {
          ...note,
          id: newId,
          updated: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setEditingNote(null);
    setSelectedNoteId(note.id || null);
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setEditingNote(null);
  }

  // Filtering notes by search and folder
  const filteredNotes = notes.filter((note) => {
    const byFolder =
      selectedFolder === "All Notes" ||
      note.folder === selectedFolder ||
      (selectedFolder === "" && !note.folder);
    const bySearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    return byFolder && bySearch;
  });

  const selectedNote =
    notes.find((n) => n.id === selectedNoteId) ||
    (editingNote && notes.find((n) => n.id === editingNote.id)) ||
    null;

  return (
    <div className="notes-root">
      <TopNavBar />
      <div className="main-layout">
        <SideMenu
          folders={folders}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
        />
        <main className="main-content">
          <section className="notes-list-pane">
            <NotesList
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onSelect={handleSelectNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onCreate={handleCreateNote}
              search={search}
              setSearch={setSearch}
              folders={folders}
              selectedFolder={selectedFolder}
            />
          </section>
          <section className="note-detail-pane">
            {editingNote ? (
              <NoteEditor
                note={editingNote}
                onSave={handleSaveNote}
                onCancel={handleCancelEdit}
                folders={folders}
              />
            ) : (
              <NoteViewer
                note={selectedNote}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function TopNavBar() {
  // Simple top navigation
  return (
    <nav className="nav-bar">
      <div className="logo-block">
        <span role="img" aria-label="logo" className="logo">
          📝
        </span>
        <span className="brand">Notes</span>
      </div>
      <span className="nav-accent">Your minimal notes app</span>
    </nav>
  );
}

// PUBLIC_INTERFACE
function SideMenu({ folders, selectedFolder, setSelectedFolder }) {
  // Sidebar for folder/tag navigation
  return (
    <aside className="side-menu">
      <div className="side-menu-header">Folders</div>
      <ul className="folder-list">
        {folders.map((f) => (
          <li
            key={f}
            className={`folder-item ${
              selectedFolder === f ? "selected" : ""
            }`}
            onClick={() => setSelectedFolder(f)}
            tabIndex={0}
          >
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// PUBLIC_INTERFACE
function NotesList({
  notes,
  selectedNoteId,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
  search,
  setSearch,
  folders,
  selectedFolder,
}) {
  return (
    <div className="notes-list-container">
      <div className="notes-toolbar">
        <button className="btn btn-accent" onClick={onCreate}>
          + New Note
        </button>
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="notes-search"
        />
      </div>
      <ul className="notes-list">
        {notes.length === 0 ? (
          <li className="notes-empty">No notes</li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className={`notes-list-item ${
                note.id === selectedNoteId ? "selected" : ""
              }`}
              onClick={() => onSelect(note.id)}
            >
              <div className="notes-list-title-row">
                <span className="notes-list-title">{note.title}</span>
                <span className="notes-list-folder">
                  {note.folder ? note.folder : ""}
                </span>
              </div>
              <div className="notes-list-snippet">
                {note.content.slice(0, 40)}
                {note.content.length > 40 ? "..." : ""}
              </div>
              <div className="notes-list-actions">
                <button
                  className="btn btn-small btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(note);
                  }}
                  tabIndex={0}
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                  tabIndex={0}
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// PUBLIC_INTERFACE
function NoteViewer({ note, onEdit, onDelete }) {
  if (!note)
    return (
      <div className="note-viewer note-empty">
        <span>Select a note to view its content.</span>
      </div>
    );
  return (
    <div className="note-viewer">
      <div className="note-viewer-header">
        <span className="note-viewer-title">{note.title}</span>
        <div>
          <button
            className="btn btn-secondary btn-small"
            onClick={() => onEdit(note)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-small"
            onClick={() => onDelete(note.id)}
            style={{ marginLeft: "8px" }}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="note-viewer-meta">
        <span>
          {note.folder ? `Folder: ${note.folder}` : ""}
          {note.updated ? (
            <>&nbsp; &mdash; Last updated: {new Date(note.updated).toLocaleString()}</>
          ) : (
            ""
          )}
        </span>
      </div>
      <div className="note-viewer-content">{note.content}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ note, onSave, onCancel, folders }) {
  const [data, setData] = useState({ ...note });

  // PUBLIC_INTERFACE
  function handleChange(e) {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    onSave(data);
  }

  return (
    <form className="note-editor" onSubmit={handleSubmit}>
      <div className="note-editor-header">
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={handleChange}
          className="note-editor-title"
          placeholder="Note title"
          required
          autoFocus
        />
        <select
          name="folder"
          value={data.folder || ""}
          onChange={handleChange}
          className="note-editor-folder"
        >
          <option value="">No Folder</option>
          {folders
            .filter((f) => f !== "All Notes")
            .map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
        </select>
      </div>
      <textarea
        name="content"
        value={data.content}
        onChange={handleChange}
        className="note-editor-content"
        placeholder="Start typing your note..."
        rows={10}
        required
      />
      <div className="note-editor-actions">
        <button type="submit" className="btn btn-primary">
          {note.id ? "Update" : "Create"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ marginLeft: 8 }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default App;
