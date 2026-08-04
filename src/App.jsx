import { useState } from "react";
import Login from "./pages/Login";
import PostComposer from "./components/PostComposer";

function App() {

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("token") !== null
  );

  return (
    <>
      {loggedIn ? (
<PostComposer setLoggedIn={setLoggedIn} />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </>
  );
}

export default App;