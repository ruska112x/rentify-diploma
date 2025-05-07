import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { RootState } from '../state/store';
import ExtendedUserProfilePage from './ExtendedUserProfilePage';
import PartialUserProfilePage from './PartialUserProfilePage';

const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { accessToken } = useSelector((state: RootState) => state.auth);

    if (accessToken) {
        return <ExtendedUserProfilePage userId={userId} />;
    } else {
        return <PartialUserProfilePage userId={userId} />;
    }
};

export default UserProfilePage;