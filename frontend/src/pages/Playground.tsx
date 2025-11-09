import { Box, Container, Typography } from '@mui/material';

export default function Playground() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          API Playground
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test and experiment with different AI providers and models
        </Typography>
      </Box>
      <Typography color="text.secondary">Playground page - to be implemented</Typography>
    </Container>
  );
}
