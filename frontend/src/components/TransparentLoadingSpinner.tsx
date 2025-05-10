import { CircularProgress, Box } from "@mui/material";

interface TransparentLoadingSpinnerProps {
    isLoading: boolean;
}

const TransparentLoadingSpinner: React.FC<TransparentLoadingSpinnerProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1300,
            }}
        >
            <CircularProgress size={60} thickness={4} />
        </Box>
    );
};

export default TransparentLoadingSpinner;