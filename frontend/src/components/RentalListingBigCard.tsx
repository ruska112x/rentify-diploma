import { Box, Paper, Typography } from "@mui/material";
import { PartialRentalListing } from "../shared/types";
import ImageSquare from "./ImageSquare";

interface RentalListingBigCardProps {
  rental: PartialRentalListing;
}

const RentalListingBigCard: React.FC<RentalListingBigCardProps> = ({ rental }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "300px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ flexShrink: 0, mr: 4 }}>
        <ImageSquare imageUrl={rental.mainImageData.link} size={256} altText="Главное изображение объявления" />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3">
          {rental.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Адрес: {rental.address}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Тариф: {rental.tariffDescription}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RentalListingBigCard;