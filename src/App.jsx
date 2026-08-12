
import { useState, useCallback } from "react";
import Login from "./pages/Login";
import PostComposer from "./components/PostComposer";
import CalendarView from "./components/CalendarView";

function App() {

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("token") !== null
  );
  const [selectedPost, setSelectedPost] = useState(null);
  
const handlePostSelect = useCallback((post) => {
  setSelectedPost(post);
}, []);

  return (
    <>
    {loggedIn ? (
  <>
   <PostComposer
  setLoggedIn={setLoggedIn}
  selectedPost={selectedPost}
  clearSelectedPost={() => setSelectedPost(null)}
/>

    <CalendarView
  onPostSelect={handlePostSelect}
/>
  </>
) : (
  <Login onLogin={() => setLoggedIn(true)} />
)}
    </>
  );
}


export default App;