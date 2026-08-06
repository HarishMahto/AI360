// AI360 – Loading Skeleton Components
import { Skeleton, Card, CardContent, Box, Grid } from '@mui/material';

const cardSx = {
  borderRadius: 3.5, 
  border: '1px solid rgba(0,0,0,0.08)', 
  boxShadow: 'none', 
  bgcolor: '#FFFFFF'
};

const skeletonSx = { 
  bgcolor: '#F5F5F7' 
};

export function MetricCardSkeleton() {
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Skeleton animation="wave" variant="text" width="60%" height={20} sx={{ mb: 2, ...skeletonSx }} />
        <Skeleton animation="wave" variant="text" width="40%" height={48} sx={{ mb: 0.5, ...skeletonSx }} />
        <Skeleton animation="wave" variant="text" width="30%" height={16} sx={skeletonSx} />
        <Box sx={{ mt: 1.5 }}>
          <Skeleton animation="wave" variant="rounded" width={80} height={22} sx={{ borderRadius: 99, ...skeletonSx }} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Skeleton animation="wave" variant="text" width="40%" height={24} sx={{ mb: 2, ...skeletonSx }} />
        <Skeleton animation="wave" variant="rounded" height={height} sx={{ borderRadius: 2, ...skeletonSx }} />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Skeleton animation="wave" variant="text" width="30%" height={24} sx={{ mb: 2, ...skeletonSx }} />
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
            <Skeleton animation="wave" variant="rounded" width={32} height={32} sx={{ borderRadius: 1, flexShrink: 0, ...skeletonSx }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton animation="wave" variant="text" width="80%" height={16} sx={skeletonSx} />
              <Skeleton animation="wave" variant="text" width="50%" height={14} sx={skeletonSx} />
            </Box>
            <Skeleton animation="wave" variant="text" width={60} height={16} sx={skeletonSx} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={2.5}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}><MetricCardSkeleton /></Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}><ChartSkeleton height={280} /></Grid>
        <Grid item xs={12} md={4}><ChartSkeleton height={280} /></Grid>
      </Grid>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}><TableSkeleton /></Grid>
        <Grid item xs={12} md={6}><ChartSkeleton height={200} /></Grid>
      </Grid>
    </Box>
  );
}
