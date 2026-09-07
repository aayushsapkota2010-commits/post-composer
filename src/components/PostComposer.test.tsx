import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import PostComposer from "./PostComposer";
import postReducer from "../features/posts/postSlice";
import platformReducer from "../features/platforms/platformSlice";

const createTestStore = () => {
  return configureStore({
    reducer: {
      posts: postReducer,
      platforms: platformReducer,
    },
    preloadedState: {
      posts: {
        posts: [],
      },
      platforms: {
        selectedPlatforms: [],
      },
    },
  });
};

const renderPostComposer = (
  store: ReturnType<typeof createTestStore>
) => {
  return render(
    <Provider store={store}>
      <PostComposer
        setLoggedIn={() => {}}
        clearSelectedPost={() => {}}
      />
    </Provider>
  );
};

describe("PostComposer Component", () => {
  beforeEach(() => {
    localStorage.removeItem("posts");
    localStorage.removeItem("postData");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("name");
  });

  afterEach(() => {
    localStorage.removeItem("posts");
    localStorage.removeItem("postData");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("name");
  });

  test("renders Post Composer heading", () => {
    const store = createTestStore();

    renderPostComposer(store);

    expect(
      screen.getByText(/post composer/i)
    ).toBeInTheDocument();
  });

  test("allows user to enter post text", () => {
    const store = createTestStore();

    renderPostComposer(store);

    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, {
      target: {
        value: "Hello from my test!",
      },
    });

    expect(textarea).toHaveValue("Hello from my test!");
  });

  test("publishes a post when platform and text are selected", () => {
    const store = createTestStore();

    renderPostComposer(store);

    const textArea = screen.getByRole("textbox");

    fireEvent.change(textArea, {
      target: {
        value: "Testing my Post Composer",
      },
    });

    const linkedinCheckbox = screen.getByLabelText(
      "LinkedIn"
    );

    fireEvent.click(linkedinCheckbox);

    const publishButton = screen.getByRole("button", {
      name: /publish/i,
    });

    expect(publishButton).not.toBeDisabled();

    fireEvent.click(publishButton);

    const state = store.getState();

    expect(state.posts.posts).toHaveLength(1);

    expect(state.posts.posts[0].text).toBe(
      "Testing my Post Composer"
    );

    expect(state.posts.posts[0].platforms).toContain(
      "LinkedIn"
    );
  });

  test("updates an existing post", () => {
    const store = createTestStore();

    const existingPost = {
      id: "test-post-1",
      text: "Original Post",
      platforms: ["LinkedIn"],
      mediaFiles: [],
      scheduleTime: "",
      createdAt: "Today",
      updatedAt: "Today",
    };

    store.dispatch({
      type: "posts/addPost",
      payload: existingPost,
    });

    localStorage.setItem("role", "ADMIN");

    renderPostComposer(store);

    expect(
      screen.getByText("Original Post")
    ).toBeInTheDocument();

    const updateButton = screen.getByRole("button", {
      name: /update/i,
    });

    fireEvent.click(updateButton);

    const textArea = screen.getByRole("textbox");

    expect(textArea).toHaveValue("Original Post");

    fireEvent.change(textArea, {
      target: {
        value: "Updated Post",
      },
    });

    const updatePostButton = screen.getByRole("button", {
      name: /update post/i,
    });

    fireEvent.click(updatePostButton);

    const state = store.getState();

    expect(state.posts.posts).toHaveLength(1);

    expect(state.posts.posts[0].id).toBe(
      "test-post-1"
    );

    expect(state.posts.posts[0].text).toBe(
      "Updated Post"
    );
  });

  test("deletes an existing post", () => {
    const store = createTestStore();

    const existingPost = {
      id: "delete-post-1",
      text: "Post To Delete",
      platforms: ["LinkedIn"],
      mediaFiles: [],
      scheduleTime: "",
      createdAt: "Today",
      updatedAt: "Today",
    };

    store.dispatch({
      type: "posts/addPost",
      payload: existingPost,
    });

    localStorage.setItem("role", "ADMIN");

    renderPostComposer(store);

    expect(
      screen.getByText("Post To Delete")
    ).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", {
      name: /delete/i,
    });

    fireEvent.click(deleteButton);

    const state = store.getState();

    expect(state.posts.posts).toHaveLength(0);

    expect(
      screen.queryByText("Post To Delete")
    ).not.toBeInTheDocument();
  });

  test("hides Update and Delete buttons for normal users", () => {
    const store = createTestStore();

    const existingPost = {
      id: "user-post-1",
      text: "User Post",
      platforms: ["LinkedIn"],
      mediaFiles: [],
      scheduleTime: "",
      createdAt: "Today",
      updatedAt: "Today",
    };

    store.dispatch({
      type: "posts/addPost",
      payload: existingPost,
    });

    localStorage.setItem("role", "USER");

    renderPostComposer(store);

    expect(
      screen.getByText("User Post")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /update/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /delete/i,
      })
    ).not.toBeInTheDocument();
  });
});