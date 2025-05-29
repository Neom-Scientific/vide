const { createSlice } = require("@reduxjs/toolkit");


const initialState = {
    activeTab: "dashboard", // Default active tab
    taskId: null,
    tab:[
        { value: "dashboard", name: "Home" },
        { value: "sample-register", name: "New Project" },
        { value: "processing", name: "Project Analysis" },
        { value: "library-preparation", name: "Library Prepration" },
        { value: "run-setup", name: "Run Setup" },
        { value: "reports", name: "Reports" }
    ]
};

const tabSlice=createSlice({
    name: "tab",
    initialState,
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setTaskId: (state, action) => {
            state.taskId = action.payload;
        },
    },
})
export const { setActiveTab , setTaskId } = tabSlice.actions;
export default tabSlice.reducer;