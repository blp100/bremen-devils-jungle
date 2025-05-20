import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StrictMode } from "react";

import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Join from "./pages/Join";
import NotFound from "./pages/NotFound";
import Player from "./pages/Player";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="admin" element={<Admin />} />
        <Route path="join" element={<Join />} />
        <Route path="player/:playerId" element={<Player />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
);
