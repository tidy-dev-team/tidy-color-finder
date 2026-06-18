import { TidyColorFinderUI } from "./plugins/tidy-color-finder/ui";
import "./App.css";

// Standalone shell. In the parent Tidy DS Toolbox this role is filled by the
// toolbox App + module registry; here we render the single module directly.
function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>
          Tidy Color Finder
          <span className="version">v{__APP_VERSION__}</span>
        </h1>
      </header>
      <main className="viewport">
        <div className="viewport-scroll">
          <div className="viewport-content">
            <TidyColorFinderUI />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
