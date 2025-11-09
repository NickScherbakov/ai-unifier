import { Box, Container, Typography } from '@mui/material';

export default function ApiKeys() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          API Keys
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage API keys for accessing the AI Unifier platform
        </Typography>
      </Box>
      <Typography color="text.secondary">API Keys page - to be implemented</Typography>
    </Container>
  );
}
