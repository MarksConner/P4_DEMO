import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./app/Pages/Login/LoginPage";
import { CreateUserPage } from "./app/Pages/CreateUser/CreateUserPage";
import { RecoverAccountPage } from "./app/Pages/RecoverAccount/RecoverAccountPage";
import { TodaysPlanPage } from "./app/Pages/TodaysPlan/TodaysPlanPage";
import { EventDetailsPage } from "./app/Pages/EventDetails/EventDetailsPage";
import { ProposalsPage } from "./app/Pages/Proposals/ProposalsPage";
import { AppShell } from "./app/AppShell";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-user" element={<CreateUserPage />} />
      <Route path="/recover-account" element={<RecoverAccountPage />} />

      {/* App routes inside shell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<TodaysPlanPage />} />
        <Route path="/today" element={<TodaysPlanPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/proposals" element={<ProposalsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
