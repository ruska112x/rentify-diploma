import Spinner from "./Spinner";

interface TransparentLoadingSpinnerProps {
    isLoading: boolean;
}

const TransparentLoadingSpinner: React.FC<TransparentLoadingSpinnerProps> = ({ isLoading }) => (
    <Spinner variant="overlay" isLoading={isLoading} />
);

export default TransparentLoadingSpinner;
