import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {DataProvider} from "./contexts/DataContext";
import {AuthProvider} from "./contexts/AuthContext";
import AppRoutes from "./routes";

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster position="top-right" />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
