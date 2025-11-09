import { Box, Container, Typography } from '@mui/material';

export default function Settings() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure platform settings and preferences
        </Typography>
      </Box>
      <Typography color="text.secondary">Settings page - to be implemented</Typography>
    </Container>
  );
}
