import { CircularProgress, Container, Box } from "@mui/material";

interface SpinnerProps {
    variant?: "inline" | "overlay";
    isLoading?: boolean;
    size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({
    variant = "inline",
    isLoading = true,
    size = variant === "overlay" ? 60 : 40
}) => {
    if (!isLoading) return null;

    if (variant === "overlay") {
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
                <CircularProgress size={size} thickness={4} />
            </Box>
        );
    }

    return (
        <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress size={size} />
        </Container>
    );
};

export default Spinner;
