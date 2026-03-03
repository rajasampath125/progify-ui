import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import GlobalKickoutModal from "./components/ui/GlobalKickoutModal";

function App() {
  return (
    <BrowserRouter>
      <GlobalKickoutModal />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
