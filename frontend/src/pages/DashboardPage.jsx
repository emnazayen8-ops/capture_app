import React, { useState } from "react";
import TopBar from "../components/layout/TopBar";
import Sidebar from "../components/layout/Sidebar";
import CaptureGrid from "../components/capture/CaptureGrid";

export default function DashboardPage() {
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar selectedMenuId={selectedMenuId} onSelectMenu={setSelectedMenuId} />
        <CaptureGrid menuId={selectedMenuId} />
      </div>
    </div>
  );
}
