import {
  Outlet,
  NavLink,
  useMatch,
  useResolvedPath,
  useNavigate,
} from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import { Button } from "./design_system/components/ui/Button";
import { SidePanel } from "./design_system/components/ui/SidePanel";
import { Banner } from "./design_system/components/ui/Banner";
import { Toast } from "./design_system/components/ui/Toast";
import type React from "react";

export function AppShell() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      {/* Left sidebar */}
      <Box
        component="aside"
        sx={{
          width: 220,
          borderRight: 1,
          borderColor: "divider",
          px: 1.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          AI Calendar
        </Typography>

        <List
          component="nav"
          disablePadding
          sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
        >
          <NavItem to="/">Dashboard</NavItem>
          <NavItem to="/today">Today&apos;s plan</NavItem>
          <NavItem to="/proposals">Proposals</NavItem>
        </List>
      </Box>

      {/* Main column */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          component="header"
          sx={{
            height: 56,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Typography variant="body2">Welcome back</Typography>
          <Button size="sm" variant="secondary" onClick={() => navigate("/login")}>
            Log out
          </Button>
        </Box>

        <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
          <Box component="main" sx={{ flex: 1, p: 2, overflowY: "auto" }}>
            <Box sx={{ mb: 2, maxWidth: 480 }}>
              <Toast
                variant="info"
                title="Tip"
                description="Use Today’s plan to see a detailed timeline for your day."
              />
            </Box>
            <Outlet />
          </Box>

          <Box
            component="aside"
            sx={{
              width: 280,
              borderLeft: 1,
              borderColor: "divider",
              p: 2,
            }}
          >
            <Banner
              variant="success"
              title="AI insights"
              message="Leave-by time suggestions and conflict warnings will appear here."
            />
          </Box>
        </Box>
      </Box>

      <SidePanel
        isOpen={false}
        onClose={() => {}}
        title="Details"
        side="right"
      >
        <Typography variant="body2" color="text.secondary">
          You can later use this for a slide-out details or assistant panel.
        </Typography>
      </SidePanel>
    </Box>
  );
}

function NavItem({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <ListItemButton
      component={NavLink}
      to={to}
      selected={Boolean(match)}
      disableRipple
      sx={{
        borderRadius: 1,
        px: 1.25,
        py: 1,
        fontSize: "0.875rem",
        color: "text.secondary",
        "&.Mui-selected": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
        },
        "&.Mui-selected:hover": {
          bgcolor: "primary.main",
        },
        "&:hover": {
          bgcolor: "background.paper",
          color: "text.primary",
        },
      }}
    >
      {children}
    </ListItemButton>
  );
}
