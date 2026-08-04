import { createSlice } from "@reduxjs/toolkit";

const initialState={
    selectedPlatforms:[]
};

const platformSlice=createSlice({

    name:"platform",

    initialState,

    reducers:{

        setPlatforms:(state,action)=>{
            state.selectedPlatforms=action.payload;
        }

    }

});

export const {setPlatforms}=platformSlice.actions;

export default platformSlice.reducer;