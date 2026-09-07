import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MediaFile = {
  name: string;
  type: string;
  size: number;
  data: string;
};

export type Post = {
  id: string;
  text: string;
  platforms: string[];
  mediaFiles: MediaFile[];
  scheduleTime: string;
  createdAt: string;
  updatedAt: string;
};

interface PostState {
  posts: Post[];
}

const savedPosts: Post[] = JSON.parse(
  localStorage.getItem("posts") || "[]"
);

const initialState: PostState = {
  posts: savedPosts,
};

const savePosts = (posts: Post[]) => {
  try {
    const postsWithoutMedia = posts.map((post) => ({
      ...post,
      mediaFiles: [],
    }));

    localStorage.setItem(
      "posts",
      JSON.stringify(postsWithoutMedia)
    );
  } catch (error) {
    console.error(
      "Could not save posts to localStorage:",
      error
    );
  }
};

const postSlice = createSlice({
  name: "posts",

  initialState,

  reducers: {
    addPost: (
      state,
      action: PayloadAction<Post>
    ) => {
      state.posts.push(action.payload);
      savePosts(state.posts);
    },

    deletePost: (
      state,
      action: PayloadAction<string>
    ) => {
      state.posts = state.posts.filter(
        (post) => post.id !== action.payload
      );

      savePosts(state.posts);
    },

    updatePost: (
      state,
      action: PayloadAction<Post>
    ) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id
      );

      if (index !== -1) {
        state.posts[index] = action.payload;
        savePosts(state.posts);
      }
    },
  },
});

export const {
  addPost,
  deletePost,
  updatePost,
} = postSlice.actions;

export default postSlice.reducer;