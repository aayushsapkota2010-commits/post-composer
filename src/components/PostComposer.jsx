import { useState, useEffect } from "react";
import "./PostComposer.css";
import { useSelector, useDispatch } from "react-redux";
import { addPost, deletePost, updatePost } from "../features/posts/postSlice";
import { setPlatforms } from "../features/platforms/platformSlice";

const IconUpload = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4M12 4l-5 5M12 4l5 5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4Z" />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

/* ---------- localStorage helpers ---------- */
const loadDraft = () => {
  try {
    const saved = localStorage.getItem("postData");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};



const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function PostComposer({ setLoggedIn }) {
  const [text, setText] = useState(() => loadDraft().text || "");
  const [mediaFiles, setMediaFiles] = useState(() => loadDraft().mediaFiles || []);
  const [scheduleTime, setScheduleTime] = useState(() => loadDraft().scheduleTime || "");

const [createdAt, setCreatedAt] = useState(
    new Date().toLocaleString()
);
  const [updatedAt, setUpdatedAt] = useState("");

  const dispatch = useDispatch();  //sends an action to redux store

  const posts = useSelector((state) => state.posts.posts); //redux
  console.log("Redux Posts:", posts);

  const platforms = useSelector(
    (state) => state.platforms.selectedPlatforms
  );
  const [editId, setEditId] = useState(null);
     const logout = () => {

    localStorage.removeItem("token");

    setLoggedIn(false);
};




  useEffect(() => {
    const draft = { text, platforms, mediaFiles, scheduleTime };
    localStorage.setItem("postData", JSON.stringify(draft));
  }, [text, platforms, mediaFiles, scheduleTime]);
  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
}, [posts]);

  const editPost = (post) => {
    setEditId(post.id);
    setText(post.text);
    dispatch(setPlatforms(post.platforms));
  setMediaFiles(post.mediaFiles);
    setScheduleTime(post.scheduleTime);
    setCreatedAt(post.createdAt);
    setUpdatedAt(post.updatedAt);
  };
  useEffect(() => {
    const draft = loadDraft();

    if (draft.platforms) {
        dispatch(setPlatforms(draft.platforms));
    }
}, []);

  const limits = {
    Twitter: 280,
    Facebook: 63206,
    Instagram: 2200,
    LinkedIn: 3000,
  };

  const socialPlatforms = [
    "Twitter",
    "Facebook",
    "Instagram",
    "LinkedIn",
  ];

  const handleDeletePost = (id) => {
    dispatch(deletePost(id));
    setEditId((currentEditId) => (currentEditId === id ? null : currentEditId));
  };

  const handlePlatformChange = (platform) => {

    let updatedPlatforms;

    if (platforms.includes(platform)) {
      updatedPlatforms = platforms.filter((p) => p !== platform);
    } else {
      updatedPlatforms = [...platforms, platform];
    }

    dispatch(setPlatforms(updatedPlatforms));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Max files
    if (files.length > 5) {
      alert("Maximum 5 files allowed.");
      return;
    }

    // Allowed types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "video/mp4",
    ];

    const invalidType = files.find(
      file => !allowedTypes.includes(file.type)
    );

    if (invalidType) {
      alert("Only JPG, PNG and MP4 files are allowed.");
      return;
    }

    // Max file size
    const MAX_SIZE = 2 * 1024 * 1024;

    const invalidSize = files.find(
      file => file.size > MAX_SIZE
    );

    if (invalidSize) {
      alert(`${invalidSize.name} exceeds 2 MB.`);
      return;
    }

    const promises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
          });
        };

        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((result) => {
      setMediaFiles(result);
    });
  };

  const maxCharacters =
    platforms.length > 0
      ? Math.min(...platforms.map((p) => limits[p]))
      : 0;

  const remaining = maxCharacters - text.length;

  const handlePublish = () => {
    if (platforms.length === 0) {
      alert("Please select at least one platform.");
      return;
    }

   

    const now = new Date().toLocaleString();
    if (editId !== null) {
      const updatedPost = {
        id: editId,
        text,
        platforms,
        mediaFiles,
        scheduleTime,
        createdAt,
        updatedAt: now,
      };

      dispatch(updatePost(updatedPost));

      setEditId(null);

      alert("Post Updated Successfully!");
    } else {
      const newPost = {
        id: generateId(),
        text,
        platforms,
        mediaFiles,
        scheduleTime,
        createdAt: now,
        updatedAt: now,
      };

      dispatch(addPost(newPost));
      alert("Post Published Successfully!");
    }

    setText("");
    dispatch(setPlatforms([]));
    setMediaFiles([]);
    setScheduleTime("");
    setCreatedAt("");
    setUpdatedAt("");
  };

  return (
    <div className="app-shell">
     <header className="app-header">
  <span className="app-eyebrow">Creator Studio</span>

  <h1>Dynamic Post Composer</h1>

  <p className="app-subtitle">
    Compose once, preview live, and publish across every platform.
  </p>

  <button className="logout-btn" onClick={logout}>
    Logout
  </button>
</header>

      <div className="dashboard-grid">

        {/* ---------------- LEFT COLUMN : COMPOSER ---------------- */}
        <section className="card composer-card">
          <div className="card-header">
            <h2>Compose</h2>
          </div>

          <div className="field-group">
            <label>Select Platform(s)</label>
            <div className="platforms">
              {socialPlatforms.map((platform) => (
                <label key={platform} className="platform-checkbox">
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform)}
                    onChange={() => handlePlatformChange(platform)}
                  />
                  <span className="checkbox-visual" aria-hidden="true"></span>
                  {platform}
                </label>
              ))}
            </div>

            <p className="selected-line">
              <strong>Selected:</strong>{" "}
              {platforms.length > 0 ? (
                <span className="badge-row">
                  {platforms.map((p) => (
                    <span className="badge badge-platform" key={p}>{p}</span>
                  ))}
                </span>
              ) : (
                <span className="muted">None</span>
              )}
            </p>
          </div>

          <div className="field-group">
            <textarea
              placeholder={
                platforms.length > 0
                  ? `Write your post for ${platforms.join(", ")}`
                  : "Select at least one platform..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>

            {platforms.length > 0 && (
              <div className="counter">
                <p>
                  Characters: {text.length} / {maxCharacters}
                </p>

                <p className={remaining >= 0 ? "success" : "error"}>
                  {remaining >= 0
                    ? `Remaining: ${remaining}`
                    : `Exceeded by ${Math.abs(remaining)}`}
                </p>
              </div>
            )}

            {remaining < 0 && platforms.length > 0 && (
              <p className="error">Character limit exceeded!</p>
            )}
          </div>

          <div className="field-group two-col">
            <div>
              <label className="upload-label">
                <IconUpload /> Upload Media
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label>
                <IconCalendar /> Schedule Post
              </label>
              <input
                type="datetime-local"
                value={scheduleTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          {mediaFiles.length > 0 && (
            <div className="field-group uploaded-files-block">
              <h3>Uploaded Files</h3>
              <ul className="file-list">
                {mediaFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="meta-info">
            <p><IconClock /> <strong>Created At:</strong> {createdAt}</p>
            <p><IconClock /> <strong>Updated At:</strong> {updatedAt}</p>
          </div>

          <button
            className="publish-btn"
            disabled={
              platforms.length === 0 ||
              remaining < 0 ||
              text.length === 0
            }
            onClick={handlePublish}
          >
            <IconSend /> Publish
          </button>

          {text.length > 0 &&
            remaining >= 0 &&
            platforms.length > 0 && (
              <p className="ready-badge">✅ Ready to publish!</p>
            )}
        </section>

        {/* ---------------- RIGHT COLUMN : PREVIEW ---------------- */}
        <section className="card preview-card">
          <div className="card-header">
            <h2>Preview</h2>
          </div>

          <div className="preview">
            {text || "Your post preview will appear here..."}
          </div>

          {mediaFiles.length > 0 && (
            <div className="preview-images">
              {mediaFiles.map((file, index) => {
                if (file.type.startsWith("image")) {
                  return (
                    <img
                      key={index}
                      src={file.data}
                      alt={file.name}
                    />
                  );
                }

                if (file.type.startsWith("video")) {
                  return (
                    <video key={index} width="180" controls>
                      <source src={file.data} type={file.type} />
                    </video>
                  );
                }

                return null;
              })}
            </div>
          )}

          {mediaFiles.length > 0 && (
            <ul className="file-meta-list">
              {mediaFiles.map((file, index) => (
                <li key={index}>
                  <strong>{file.name}</strong>
                  <br />
                  {file.type}
                  <br />
                  {(file.size / 1024).toFixed(2)} KB
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ---------------- PUBLISHED POSTS ---------------- */}
      {posts.length > 0 && (
        <section className="published-posts-section">
          <h2>Published Posts</h2>

          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-card">

                <div className="badge-row">
                  {post.platforms.map((p) => (
                    <span className="badge badge-platform" key={p}>{p}</span>
                  ))}
                </div>

                <p className="post-text">{post.text}</p>

                {post.mediaFiles && post.mediaFiles.length > 0 && (
                  <div className="post-media">
                    {post.mediaFiles.map((file, index) => {
                      if (file.type.startsWith("image")) {
                        return <img key={index} src={file.data} alt={file.name} />;
                      }
                      if (file.type.startsWith("video")) {
                        return (
                          <video key={index} width="140" controls>
                            <source src={file.data} type={file.type} />
                          </video>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                <div className="post-meta">
                  <p><strong>Created:</strong> {post.createdAt}</p>
                  <p><strong>Updated:</strong> {post.updatedAt}</p>
                  <p><strong>Scheduled:</strong> {post.scheduleTime || "Not Scheduled"}</p>
                </div>

                <div className="post-actions">
                  <button className="update-btn" onClick={() => editPost(post)}>
                    <IconEdit /> Update
                  </button>

                  <button className="delete-btn" onClick={() => handleDeletePost(post.id)}>
                    <IconTrash /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default PostComposer;
