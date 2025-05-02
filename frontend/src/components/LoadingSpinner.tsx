import { CircularProgress, Container } from '@mui/material';

const LoadingSpinner: React.FC = () => (
  <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Container>
);

export default LoadingSpinner;
