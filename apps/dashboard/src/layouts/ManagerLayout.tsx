// AI360 – Manager Layout (Compact Space-Filling Layout)
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useCurrentUser } from '../contexts/AuthContext';

export default function ManagerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useCurrentUser();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <Sidebar role="MANAGER" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Team Dashboard" subtitle="Managing team AI performance" collapsed={collapsed} />
        <Box
          component={motion.main}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          sx={{ flex: 1, overflow: 'auto', p: 0, pt: '52px', bgcolor: '#FAFAFA' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
