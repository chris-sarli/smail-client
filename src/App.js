import './App.css';

import AppContainer from "./components/appContainer";

import { SessionProvider } from "@inrupt/solid-ui-react";

function App() {
  return (
    <div className="App">
      <SessionProvider>
        <AppContainer></AppContainer>
      </SessionProvider>
    </div>
  );
}

export default App;
