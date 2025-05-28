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
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0, mr: 4 }}>
        <ImageSquare
          imageUrl={rental.mainImageData?.link || ""}
          size={256}
          altText={rental.title ? `Главное изображение для ${rental.title}` : "Главное изображение объявления"}
          fallbackText="Изображение отсутствует"
        />
      </Box>
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: "medium" }}>
          {rental.title || "Без названия"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Населённый пункт:</strong> {rental.address}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Цена за час аренды:</strong> {rental.tariff || "Не указан"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RentalListingBigCard;