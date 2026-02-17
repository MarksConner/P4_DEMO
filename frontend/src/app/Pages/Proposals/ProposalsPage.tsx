import {
  Card,
  CardHeader,
  CardContent,
} from "../../design_system/components/ui/Card";
import { Button } from "../../design_system/components/ui/Button";
import { Chip } from "../../design_system/components/ui/Chip";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export const ProposalsPage = () => {
  return (
    <Stack spacing={2} sx={{ maxWidth: 672 }}>
      <Typography variant="h5" fontWeight={600}>
        Proposed plans
      </Typography>
      <Typography variant="body2" color="text.secondary">
        These are AI-generated schedule options based on your constraints.
      </Typography>

      <Stack spacing={1.5}>
        <Card variant="elevated">
          <CardHeader>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Balanced afternoon
              </Typography>
              <Chip label="Recommended" variant="primary" />
            </Box>
          </CardHeader>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
              Spreads deep work blocks with short breaks and moves non-urgent
              meetings to tomorrow.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                <Button size="sm">Accept</Button>
                <Button size="sm" variant="secondary">
                  Compare
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};
