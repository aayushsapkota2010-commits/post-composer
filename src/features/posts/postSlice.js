import { createSlice } from "@reduxjs/toolkit";

const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];

const initialState = {
    posts: savedPosts
};

const postSlice = createSlice({

    name:"posts",

    initialState,

    reducers:{

        addPost:(state,action)=>{
            state.posts.push(action.payload);
        },

        deletePost:(state,action)=>{
            state.posts = state.posts.filter(
                post=>post.id!==action.payload
            );
        },

        updatePost:(state,action)=>{

            const index = state.posts.findIndex(
                post=>post.id===action.payload.id
            );

            if(index!==-1){
                state.posts[index]=action.payload;
            }

        }

    }

});


export const {addPost,deletePost,updatePost}=postSlice.actions;

export default postSlice.reducer;