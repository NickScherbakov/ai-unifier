import { Box, Container, Typography, Paper, Grid, Chip, Button } from '@mui/material';
import { CheckCircle as CheckIcon, Error as ErrorIcon } from '@mui/icons-material';

export default function Providers() {
  const providers = [
    { id: 'openai', name: 'OpenAI', status: 'active', models: ['GPT-4', 'GPT-3.5', 'DALL-E'] },
    { id: 'anthropic', name: 'Anthropic', status: 'active', models: ['Claude 3'] },
    { id: 'google', name: 'Google AI', status: 'inactive', models: ['Gemini Pro'] },
    { id: 'mistral', name: 'Mistral AI', status: 'active', models: ['Mistral Large'] },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            AI Providers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure and manage AI service providers
          </Typography>
        </Box>
        <Button variant="contained" color="primary">
          Add Provider
        </Button>
      </Box>

      <Grid container spacing={3}>
        {providers.map((provider) => (
          <Grid item xs={12} md={6} key={provider.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{provider.name}</Typography>
                <Chip
                  label={provider.status}
                  color={provider.status === 'active' ? 'success' : 'default'}
                  icon={provider.status === 'active' ? <CheckIcon /> : <ErrorIcon />}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Available Models:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {provider.models.map((model) => (
                  <Chip key={model} label={model} size="small" variant="outlined" />
                ))}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined">
                  Configure
                </Button>
                <Button size="small" variant="outlined" color="secondary">
                  Test
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
