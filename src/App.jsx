import { Route, Routes, useSearchParams } from "react-router-dom";
import { WorksheetForm } from "./components/WorksheetForm.jsx";
import { WorksheetPage } from "./components/WorksheetPage.jsx";
import { DEFAULT_CONFIG, parseWorksheetParams } from "./lib/config.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WorksheetFormRoute />} />
      <Route path="/worksheet" element={<WorksheetPageRoute />} />
    </Routes>
  );
}

function WorksheetFormRoute() {
  const [params] = useSearchParams();
  const initialConfig = params.size > 0 ? parseWorksheetParams(params) : DEFAULT_CONFIG;
  return <WorksheetForm initialConfig={initialConfig} preferStoredConfig={params.size === 0} />;
}

function WorksheetPageRoute() {
  const [params] = useSearchParams();
  return <WorksheetPage config={parseWorksheetParams(params)} />;
}

