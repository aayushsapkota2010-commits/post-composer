import { useState, useEffect } from "react";
import "./PostComposer.css";

import { useSelector, useDispatch } from "react-redux";


import {
  addPost,
  deletePost,
  updatePost,
  type Post,
  type MediaFile,
} from "../features/posts/postSlice";

import { setPlatforms } from "../features/platforms/platformSlice";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { RootState, AppDispatch } from "../app/store";

import {
  saveMedia,
  getMedia,
  deleteMedia,
} from "../features/posts/mediaStorage";

type PostComposerProps = {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
  selectedPost?: Post | null;
  clearSelectedPost: () => void;
};

type Draft = {
  text?: string;
  platforms?: string[];
  scheduleTime?: string;
};
const IconUpload = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 16V4M12 4l-5 5M12 4l5 5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

const IconSend = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4Z" />
  </svg>
);

const IconEdit = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconTrash = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
  </svg>
);

const IconClock = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

/* ---------- localStorage helpers ---------- */

const loadDraft = (): Draft => {
  try {
    const saved = localStorage.getItem("postData");

    return saved ? (JSON.parse(saved) as Draft) : {};
  } catch {
    return {};
  }
};

const generateId = (): string => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

function PostComposer({
  setLoggedIn,
  selectedPost,
  clearSelectedPost,
}: PostComposerProps) {
  const [text, setText] = useState<string>(
    () => loadDraft().text || ""
  );

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const [scheduleTime, setScheduleTime] = useState<string>(
    () => loadDraft().scheduleTime || ""
  );

  const [createdAt, setCreatedAt] = useState<string>(
    new Date().toLocaleString()
  );

  const [updatedAt, setUpdatedAt] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const posts = useSelector(
    (state: RootState) => state.posts.posts
  );

  const platforms = useSelector(
    (state: RootState) => state.platforms.selectedPlatforms
  );

  const role = localStorage.getItem("role");

  /* ---------- Logout ---------- */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    setLoggedIn(false);
  };

  /* ---------- Save draft ---------- */

  useEffect(() => {
  try {
    localStorage.setItem(
      "postData",
      JSON.stringify({
        text,
        platforms,
        scheduleTime,
      })
    );
  } catch (error) {
    console.error("Could not save draft:", error);
  }
}, [text, platforms, scheduleTime]);

  /* ---------- Load selected post ---------- */

  useEffect(() => {
    if (!selectedPost) return;

    setText(selectedPost.text || "");
    setMediaFiles(selectedPost.mediaFiles || []);
    setScheduleTime(selectedPost.scheduleTime || "");
    setCreatedAt(selectedPost.createdAt || "");
    setUpdatedAt(selectedPost.updatedAt || "");
    setEditId(selectedPost.id);

    dispatch(setPlatforms(selectedPost.platforms || []));
  }, [selectedPost, dispatch]);

/* ---------- Load media from IndexedDB ---------- */

useEffect(() => {
  const loadPostMedia = async () => {
    try {
      for (const post of posts) {
        const media = await getMedia(post.id);

        if (media.length > 0) {
          dispatch(
            updatePost({
              ...post,
              mediaFiles: media,
            })
          );
        }
      }
    } catch (error) {
      console.error(
        "Could not load media:",
        error
      );
    }
  };

  if (posts.length > 0) {
    loadPostMedia();
  }
}, [dispatch]);


  /* ---------- Load saved platforms from draft ---------- */

  useEffect(() => {
    const draft = loadDraft();

    if (draft.platforms) {
      dispatch(setPlatforms(draft.platforms));
    }
  }, [dispatch]);

  /* ---------- Edit post ---------- */

  const editPost = (post: Post) => {
    setEditId(post.id);
    setText(post.text);
    setMediaFiles(post.mediaFiles);
    setScheduleTime(post.scheduleTime);
    setCreatedAt(post.createdAt);
    setUpdatedAt(post.updatedAt);

    dispatch(setPlatforms(post.platforms));
  };

  /* ---------- Platform limits ---------- */

  const limits: Record<string, number> = {
    Twitter: 280,
    Facebook: 63206,
    Instagram: 2200,
    LinkedIn: 3000,
  };

  const socialPlatforms: string[] = [
    "Twitter",
    "Facebook",
    "Instagram",
    "LinkedIn",
  ];

  /* ---------- Delete post ---------- */

 const handleDeletePost = async (id: string) => {
  try {
    await deleteMedia(id);

    dispatch(deletePost(id));

    setEditId((currentEditId) =>
      currentEditId === id ? null : currentEditId
    );

    clearSelectedPost();
  } catch (error) {
    console.error(
      "Could not delete media:",
      error
    );
  }
};

  /* ---------- Platform selection ---------- */

  const handlePlatformChange = (platform: string) => {
    let updatedPlatforms: string[];

    if (platforms.includes(platform)) {
      updatedPlatforms = platforms.filter(
        (p: string) => p !== platform
      );
    } else {
      updatedPlatforms = [...platforms, platform];
    }

    dispatch(setPlatforms(updatedPlatforms));
  };

  /* ---------- File upload ---------- */

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 5) {
      alert("Maximum 5 files allowed.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "video/mp4",
    ];

    const invalidType = files.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidType) {
      alert("Only JPG, PNG and MP4 files are allowed.");
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024;

    const invalidSize = files.find(
      (file) => file.size > MAX_SIZE
    );

    if (invalidSize) {
      alert(`${invalidSize.name} exceeds 2 MB.`);
      return;
    }

    const promises: Promise<MediaFile>[] = files.map(
      (file) => {
        return new Promise<MediaFile>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: reader.result as string,
            });
          };

          reader.onerror = () => {
            reject(
              new Error(`Failed to read ${file.name}`)
            );
          };

          reader.readAsDataURL(file);
        });
      }
    );

    Promise.all(promises)
      .then((result) => {
        setMediaFiles(result);
      })
      .catch((error) => {
        console.error("Error reading files:", error);
        alert("Could not read one or more files.");
      });
  };

  /* ---------- Character counter ---------- */

  const maxCharacters =
    platforms.length > 0
      ? Math.min(
          ...platforms.map(
            (platform) => limits[platform]
          )
        )
      : 0;

  const remaining = maxCharacters - text.length;

  /* ---------- Publish / Update ---------- */

const handlePublish = async () => {
      if (platforms.length === 0) {
      alert("Please select at least one platform.");
      return;
    }

    const now = new Date().toLocaleString();

    if (editId !== null) {
      const updatedPost: Post = {
        id: editId,
        text,
        platforms,
        mediaFiles,
        scheduleTime,
        createdAt,
        updatedAt: now,
      };

await saveMedia(updatedPost.id, mediaFiles);

dispatch(updatePost(updatedPost));
      setEditId(null);
      clearSelectedPost();

      alert("Post Updated Successfully!");
    } else {
      const newPost: Post = {
        id: generateId(),
        text,
        platforms,
        mediaFiles,
        scheduleTime,
        createdAt: now,
        updatedAt: now,
      };

await saveMedia(newPost.id, mediaFiles);

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

  /* ---------- Cancel Edit ---------- */

  const handleCancelEdit = () => {
    setEditId(null);
    clearSelectedPost();

    setText("");
    setMediaFiles([]);
    setScheduleTime("");
    setCreatedAt("");
    setUpdatedAt("");

    dispatch(setPlatforms([]));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-eyebrow">
          Creator Studio
        </span>

        <h1>Dynamic Post Composer</h1>

        <p className="app-subtitle">
          Compose once, preview live, and publish across
          every platform.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>
            Welcome {localStorage.getItem("name")} ({role})
          </h3>

          <button onClick={logout}>
            Logout
          </button>
        </div>
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
                <label
                  key={platform}
                  className="platform-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform)}
                    onChange={() =>
                      handlePlatformChange(platform)
                    }
                  />

                  <span
                    className="checkbox-visual"
                    aria-hidden="true"
                  ></span>

                  {platform}
                </label>
              ))}
            </div>

            <p className="selected-line">
              <strong>Selected:</strong>{" "}

              {platforms.length > 0 ? (
                <span className="badge-row">
                  {platforms.map((platform) => (
                    <span
                      className="badge badge-platform"
                      key={platform}
                    >
                      {platform}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="muted">
                  None
                </span>
              )}
            </p>
          </div>

          <div className="field-group">
            <textarea
              placeholder={
                platforms.length > 0
                  ? `Write your post for ${platforms.join(
                      ", "
                    )}`
                  : "Select at least one platform..."
              }
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
            ></textarea>

            {platforms.length > 0 && (
              <div className="counter">
                <p>
                  Characters: {text.length} /{" "}
                  {maxCharacters}
                </p>

                <p
                  className={
                    remaining >= 0
                      ? "success"
                      : "error"
                  }
                >
                  {remaining >= 0
                    ? `Remaining: ${remaining}`
                    : `Exceeded by ${Math.abs(
                        remaining
                      )}`}
                </p>
              </div>
            )}

            {remaining < 0 &&
              platforms.length > 0 && (
                <p className="error">
                  Character limit exceeded!
                </p>
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
                min={new Date()
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) =>
                  setScheduleTime(e.target.value)
                }
              />
            </div>
          </div>

          {mediaFiles.length > 0 && (
            <div className="field-group uploaded-files-block">
              <h3>Uploaded Files</h3>

              <ul className="file-list">
                {mediaFiles.map((file, index) => (
                  <li key={index}>
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="meta-info">
            <p>
              <IconClock />{" "}
              <strong>Created At:</strong>{" "}
              {createdAt}
            </p>

            <p>
              <IconClock />{" "}
              <strong>Updated At:</strong>{" "}
              {updatedAt}
            </p>
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
            <IconSend />{" "}
            {editId !== null
              ? "Update Post"
              : "Publish"}
          </button>

          {editId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}

          {text.length > 0 &&
            remaining >= 0 &&
            platforms.length > 0 && (
              <p className="ready-badge">
                ✅ Ready to publish!
              </p>
            )}
        </section>

        {/* ---------------- RIGHT COLUMN : PREVIEW ---------------- */}

        <section className="card preview-card">
          <div className="card-header">
            <h2>Preview</h2>
          </div>

          <div className="preview">
            {text ||
              "Your post preview will appear here..."}
          </div>

          {mediaFiles.length > 0 && (
            <div className="preview-images">
              {mediaFiles.map((file, index) => {
                if (
                  file.type.startsWith("image")
                ) {
                  return (
                    <img
                      key={index}
                      src={file.data}
                      alt={file.name}
                    />
                  );
                }

                if (
                  file.type.startsWith("video")
                ) {
                  return (
                    <video
                      key={index}
                      width="180"
                      controls
                    >
                      <source
                        src={file.data}
                        type={file.type}
                      />
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
              <div
                key={post.id}
                className="post-card"
              >
                <div className="badge-row">
                  {post.platforms.map(
                    (platform) => (
                      <span
                        className="badge badge-platform"
                        key={platform}
                      >
                        {platform}
                      </span>
                    )
                  )}
                </div>

                <p className="post-text">
                  {post.text}
                </p>

                {post.mediaFiles &&
                  post.mediaFiles.length > 0 && (
                    <div className="post-media">
                      {post.mediaFiles.map(
                        (file, index) => {
                          if (
                            file.type.startsWith(
                              "image"
                            )
                          ) {
                            return (
                              <img
                                key={index}
                                src={file.data}
                                alt={file.name}
                              />
                            );
                          }

                          if (
                            file.type.startsWith(
                              "video"
                            )
                          ) {
                            return (
                              <video
                                key={index}
                                width="140"
                                controls
                              >
                                <source
                                  src={file.data}
                                  type={file.type}
                                />
                              </video>
                            );
                          }

                          return null;
                        }
                      )}
                    </div>
                  )}

                <div className="post-meta">
                  <p>
                    <strong>Created:</strong>{" "}
                    {post.createdAt}
                  </p>

                  <p>
                    <strong>Updated:</strong>{" "}
                    {post.updatedAt}
                  </p>

                  <p>
                    <strong>Scheduled:</strong>{" "}
                    {post.scheduleTime ||
                      "Not Scheduled"}
                  </p>
                </div>

                <div className="post-actions">
                  {role === "ADMIN" && (
                    <button
                      className="update-btn"
                      onClick={() =>
                        editPost(post)
                      }
                    >
                      <IconEdit /> Update
                    </button>
                  )}

                  {role === "ADMIN" && (
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDeletePost(post.id)
                      }
                    >
                      <IconTrash /> Delete
                    </button>
                  )}
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