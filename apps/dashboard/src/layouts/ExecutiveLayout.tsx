// AI360 – Executive Layout (Compact Space-Filling Layout)
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ExecutiveLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <Sidebar role="EXECUTIVE" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Executive Overview" subtitle="Organization-wide AI intelligence" collapsed={collapsed} />
        <Box component={motion.main} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} sx={{ flex: 1, overflow: 'auto', p: 0, pt: '70px', bgcolor: '#FAFAFA' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
