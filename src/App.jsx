import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./api/AuthContext.jsx";
import { LanguageProvider } from "./api/LanguageContext.jsx";
import { router } from "./router/index.jsx";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LanguageProvider>
  );
}
