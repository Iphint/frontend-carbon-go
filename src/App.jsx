import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./api/AuthContext.jsx";
import { LanguageProvider } from "./api/LanguageContext.jsx";
import { router } from "./router/index.jsx";
import ChatbaseBot from "./components/ChatbaseBot.jsx";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <ChatbaseBot />
      </AuthProvider>
    </LanguageProvider>
  );
}
