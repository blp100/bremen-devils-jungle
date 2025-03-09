import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Admin from "./pages/Admin";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Player from "./pages/Player";

import "./style.css";

const root = createRoot(document.querySelector("#root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="admin" element={<Admin />} />
      <Route path="player/:playerId" element={<Player />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>,
);
