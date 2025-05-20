import { useEffect, useState } from "react";
import authoredApi from "../api/authoredApi";
import { ExtendedRentalListing } from "../shared/types";
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    Button,
    Tabs,
    Tab,
} from "@mui/material";
import RentalListingAddDialog from "../dialogs/RentalListingAddDialog";
import RentalListingEditDialog from "../dialogs/RentalListingEditDialog";
import { Link } from "react-router";
import api from "../api/api";
import LoadingSpinner from "./LoadingSpinner";
import ImageSquare from "./ImageSquare";
import RentalListingBookingsCard from "./RentalListingBookingsCard";

interface RentalListingsCardProps {
    userId: string;
}

const RentalListingsCard: React.FC<RentalListingsCardProps> = ({ userId }) => {
    const [activeRentalListings, setActiveRentalListings] = useState<Array<ExtendedRentalListing>>([]);
    const [archivedRentalListings, setArchivedRentalListings] = useState<Array<ExtendedRentalListing>>([]);
    const [loading, setLoading] = useState(true);

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const initializeRentalListings = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/users/${userId}/activeRentalListings`);
            const listings: ExtendedRentalListing[] = response.data;
            setActiveRentalListings(listings);

            const archivedResponse = await api.get(`/users/${userId}/archivedRentalListings`);
            const archivedListings: ExtendedRentalListing[] = archivedResponse.data;
            setArchivedRentalListings(archivedListings);
        } catch (error) {
            console.error("Error fetching rental listings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeRentalListings();
    }, [userId]);

    const [open, setOpen] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [rentalToPass, setRentalToPass] = useState<ExtendedRentalListing>({
        id: "",
        title: "",
        description: "",
        address: "",
        tariffDescription: "",
        autoRenew: false,
        mainImageData: {
            key: null,
            link: "",
        },
        additionalImagesData: [],
        userId: "",
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenEditDialog = (rental: ExtendedRentalListing) => {
        setOpenUpdateDialog(true);
        setRentalToPass(rental);
    };

    const handleCloseUpdateDialog = () => {
        setOpenUpdateDialog(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await authoredApi.delete(`/rentalListings/${id}`);
            setActiveRentalListings(activeRentalListings.filter((rental) => rental.id !== id));
            initializeRentalListings();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Не удалось удалить объявление. Пожалуйста, попробуйте позже.");
        }
    };

    const handleArchive = async (id: string) => {
        try {
            await authoredApi.post(`/archiveRentalListings/${id}`);
            initializeRentalListings();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Не удалось архивировать объявление. Пожалуйста, попробуйте позже.");
        }
    };

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <>
            <Box sx={{ mt: 1 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Активные" />
                    <Tab label="Архивированные" />
                </Tabs>

                {tabValue === 0 &&
                    (
                        activeRentalListings.length === 0 ? (
                            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                                Объявлений не найдено
                            </Typography>
                        ) : (
                            <List>
                                {activeRentalListings.map((rental) => (
                                    <Paper key={rental.id} elevation={2} sx={{ mb: 2, p: 2 }}>
                                        <ListItem sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 4 }}>
                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                                <Box sx={{ display: "flex", flexDirection: "row", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                                    <ImageSquare imageUrl={rental.mainImageData.link} altText="Главное изображение объявления" />
                                                    {rental.additionalImagesData.map((imageData, idx) => (
                                                        <ImageSquare key={`${rental.id}-additional-${idx}`} imageUrl={imageData.link} altText={`Дополнительное изображение ${idx}`} />
                                                    ))}
                                                </Box>
                                                <Link key={rental.id} to={`/rentalListings/${rental.id}`} style={{ textDecoration: "none" }}>
                                                    <Typography variant="h6">{rental.title}</Typography>
                                                </Link>
                                                <Box display="flex" flexDirection="column">
                                                    <Typography component="span" variant="body2" sx={{ mt: 1 }}>
                                                        {rental.description}
                                                    </Typography>
                                                    <Typography component="span" variant="body2">
                                                        Адрес: {rental.address}
                                                    </Typography>
                                                    <Typography component="span" variant="body2">
                                                        Тариф: {rental.tariffDescription}
                                                    </Typography>
                                                    <Typography component="span" variant="body2">
                                                        Автопродление: {rental.autoRenew ? "Yes" : "No"}
                                                    </Typography>
                                                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleOpenEditDialog(rental)}
                                                        >
                                                            Редактировать
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="warning"
                                                            size="small"
                                                            onClick={() => handleArchive(rental.id)}
                                                        >
                                                            Архивировать
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleDelete(rental.id)}
                                                        >
                                                            Удалить
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <RentalListingBookingsCard rentalListingId={rental.id} />
                                        </ListItem>
                                    </Paper>
                                ))}
                            </List>
                        )
                    )
                }

                {tabValue === 1 && (
                    archivedRentalListings.length === 0 ? (
                        <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                            Объявлений не найдено
                        </Typography>
                    ) : (
                        <List>
                            {archivedRentalListings.map((rental) => (
                                <Paper key={rental.id} elevation={2} sx={{ mb: 2, p: 2 }}>
                                    <ListItem sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 4 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                                <ImageSquare imageUrl={rental.mainImageData.link} altText="Главное изображение объявления" />
                                                {rental.additionalImagesData.map((imageData, idx) => (
                                                    <ImageSquare key={`${rental.id}-additional-${idx}`} imageUrl={imageData.link} altText={`Дополнительное изображение ${idx}`} />
                                                ))}
                                            </Box>
                                            <Link key={rental.id} to={`/rentalListings/${rental.id}`} style={{ textDecoration: "none" }}>
                                                <Typography variant="h6">{rental.title}</Typography>
                                            </Link>
                                            <Box display="flex" flexDirection="column">
                                                <Typography component="span" variant="body2" sx={{ mt: 1 }}>
                                                    {rental.description}
                                                </Typography>
                                                <Typography component="span" variant="body2">
                                                    Адрес: {rental.address}
                                                </Typography>
                                                <Typography component="span" variant="body2">
                                                    Тариф: {rental.tariffDescription}
                                                </Typography>
                                                <Typography component="span" variant="body2">
                                                    Автопродление: {rental.autoRenew ? "Yes" : "No"}
                                                </Typography>
                                                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDelete(rental.id)}
                                                    >
                                                        Удалить
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <RentalListingBookingsCard rentalListingId={rental.id} />
                                    </ListItem>
                                </Paper>
                            ))}
                        </List>
                    )
                )}


                <Button variant="contained" onClick={() => setOpen(true)}>
                    Создать новое объявление
                </Button>
            </Box>

            <RentalListingAddDialog
                isOpen={open}
                userId={userId}
                handleClose={handleClose}
                initializeRentalListings={initializeRentalListings}
            />
            <RentalListingEditDialog
                isOpen={openUpdateDialog}
                rental={rentalToPass}
                handleClose={handleCloseUpdateDialog}
                initializeRentalListings={initializeRentalListings}
            />
        </>
    );
};

export default RentalListingsCard;
