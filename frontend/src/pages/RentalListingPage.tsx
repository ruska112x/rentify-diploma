import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { RootState } from "../state/store";
import ExtendedRentalListingPage from "./ExtendedRentalListingPage";
import PartialRentalListingPage from "./PartialRentalListingPage";

const RentalListingPage: React.FC = () => {
    const { rentalListingId } = useParams<{ rentalListingId: string }>();
    const { accessToken } = useSelector((state: RootState) => state.auth);

    if (accessToken) {
        return <ExtendedRentalListingPage rentalListingId={rentalListingId} />;
    } else {
        return <PartialRentalListingPage rentalListingId={rentalListingId} />;
    }
};

export default RentalListingPage;