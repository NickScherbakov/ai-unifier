import { Box, Container, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';

export default function Dashboard() {
  const stats = [
    { title: 'Total Requests', value: '12,543', icon: <TrendingUpIcon />, color: '#1976d2' },
    { title: 'Avg Response Time', value: '245ms', icon: <SpeedIcon />, color: '#2e7d32' },
    { title: 'Total Cost', value: '$124.50', icon: <MoneyIcon />, color: '#ed6c02' },
    { title: 'Active Providers', value: '5', icon: <CloudIcon />, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your AI Unifier platform usage and performance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: stat.color,
                      color: 'white',
                      p: 1,
                      borderRadius: 1,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5">{stat.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Volume (Last 7 Days)
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Chart placeholder - implement with Recharts</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Provider Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Chart placeholder - implement with Recharts</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography color="text.secondary">Activity log placeholder</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
