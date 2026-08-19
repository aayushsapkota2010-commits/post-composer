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
  });
};

describe("PostComposer Component", () => {

  test("renders Post Composer heading", () => {

    const store = createTestStore();

    render(
      <Provider store={store}>
        <PostComposer />
      </Provider>
    );

    expect(
      screen.getByText(/post composer/i)      //screen provides method to find the element which is currently rendered
    ).toBeInTheDocument();

  });

  test("allows user to enter post text", () => {
  const store = createTestStore();

  render(
    <Provider store={store}>
      <PostComposer />
    </Provider>
  );

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

  render(
    <Provider store={store}>
      <PostComposer />
    </Provider>
  );

  // Enter post text
  const textArea = screen.getByRole("textbox");

  fireEvent.change(textArea, {
    target: {
      value: "Testing my Post Composer",
    },
  });

  // Select LinkedIn platform
  const linkedinCheckbox = screen.getByLabelText("LinkedIn");

  fireEvent.click(linkedinCheckbox);

  // Find Publish button
  const publishButton = screen.getByRole("button", {
    name: /publish/i,
  });

  // Button should now be enabled
  expect(publishButton).not.toBeDisabled();

  // Publish the post
  fireEvent.click(publishButton);

  // Check Redux state
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

  // Simulate logged-in Admin
  localStorage.setItem("role", "ADMIN");

  render(
    <Provider store={store}>
     <PostComposer clearSelectedPost={() => {}} />
    </Provider>
  );

  expect(
    screen.getByText("Original Post")
  ).toBeInTheDocument();

  // Find Update button
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

  const publishButton = screen.getByRole("button", {
    name: /publish/i,
  });

  fireEvent.click(publishButton);

  const state = store.getState();

  expect(state.posts.posts).toHaveLength(1);

  expect(state.posts.posts[0].id).toBe(
    "test-post-1"
  );

  expect(state.posts.posts[0].text).toBe(
    "Updated Post"
  );

  // Clean up role after test
  localStorage.removeItem("role");
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

  // Simulate Admin
  localStorage.setItem("role", "ADMIN");

  render(
    <Provider store={store}>
      <PostComposer clearSelectedPost={() => {}} />
    </Provider>
  );

  // Confirm post exists
  expect(
    screen.getByText("Post To Delete")
  ).toBeInTheDocument();

  // Find Delete button
  const deleteButton = screen.getByRole("button", {
    name: /delete/i,
  });

  // Delete the post
  fireEvent.click(deleteButton);

  // Check Redux state
  const state = store.getState();

  expect(state.posts.posts).toHaveLength(0);

  // Post should no longer be visible
  expect(
    screen.queryByText("Post To Delete")
  ).not.toBeInTheDocument();

  // Clean up
  localStorage.removeItem("role");
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

  // Simulate normal USER
  localStorage.setItem("role", "USER");

  render(
    <Provider store={store}>
      <PostComposer clearSelectedPost={() => {}} />
    </Provider>
  );

  // Post should still be visible
  expect(
    screen.getByText("User Post")
  ).toBeInTheDocument();

  // Admin-only buttons should NOT exist
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

  // Clean up
  localStorage.removeItem("role");
});

});