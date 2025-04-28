import { Box, Paper, Typography } from "@mui/material";
import { OneRentalListing } from "../shared/types";

interface RentalListingBigCardProps {
  rental: OneRentalListing;
}

const RentalListingBigCard: React.FC<RentalListingBigCardProps> = ({ rental }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: '300px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ flexShrink: 0, mr: 4 }}>
        <img
          src={''}
          alt={`${rental.title} main photo`}
          style={{
            width: '100%',
            maxWidth: '200px',
            height: 'auto',
            borderRadius: '8px',
          }}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3">
          {rental.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Address: {rental.address}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tariff: {rental.tariffDescription}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RentalListingBigCard;