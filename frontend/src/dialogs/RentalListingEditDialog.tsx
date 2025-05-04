import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControlLabel,
    DialogActions,
    Button,
    Switch,
    Typography,
    IconButton,
} from '@mui/material';
import { useEffect, useState } from 'react';
import authoredApi from '../api/authoredApi';
import { ExtendedRentalListing, ImageAction } from '../shared/types';
import DeleteIcon from '@mui/icons-material/Delete';

interface RentalListingEditDialogProps {
    isOpen: boolean;
    rental: ExtendedRentalListing;
    handleClose: () => void;
    initializeRentalListings: () => void;
}

const RentalListingEditDialog: React.FC<RentalListingEditDialogProps> = ({
    isOpen,
    rental,
    handleClose,
    initializeRentalListings,
}) => {
    const [updateFormData, setUpdateFormData] = useState({
        id: '',
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: false,
    });
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const [mainImageAction, setMainImageAction] = useState<string | null>(null);
    const [additionalImages, setAdditionalImages] = useState<File[]>([]);
    const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState<string[]>([]);
    const [additionalImageActions, setAdditionalImageActions] = useState<ImageAction[]>([]);

    const [formErrors, setFormErrors] = useState({
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: '',
        mainImage: '',
        additionalImages: '',
    });

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_ADDITIONAL_IMAGES = 4;
    const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg'];

    useEffect(() => {
        setUpdateFormData({
            id: rental.id,
            title: rental.title,
            description: rental.description,
            address: rental.address,
            tariffDescription: rental.tariffDescription,
            autoRenew: rental.autoRenew,
        });
        setMainImage(null);
        setMainImagePreview(rental.mainImageData.link || null);
        setMainImageAction(null);
        setAdditionalImages([]);
        setAdditionalImagesPreviews(rental.additionalImagesData.map(it => it.link) || []);
        setAdditionalImageActions(
            rental.additionalImagesData.map(it => ({
                key: it.key,
                action: 'keep',
                newFileName: null,
            } as ImageAction))
        );
        setFormErrors({
            title: '',
            description: '',
            address: '',
            tariffDescription: '',
            autoRenew: '',
            mainImage: '',
            additionalImages: '',
        });
    }, [rental]);

    const handleChangeUpdateDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpdateFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSwitchChangeUpdateDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateFormData((prev) => ({
            ...prev,
            autoRenew: e.target.checked,
        }));
    };

    const handleMainImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMainImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processMainImage(file);
        }
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processMainImage(file);
        }
    };

    const processMainImage = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            setFormErrors((prev) => ({
                ...prev,
                mainImage: 'Main image must be less than 5MB',
            }));
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setFormErrors((prev) => ({
                ...prev,
                mainImage: 'Main image must be PNG or JPEG',
            }));
            return;
        }

        setMainImage(file);
        setMainImageAction('change');
        setFormErrors((prev) => ({ ...prev, mainImage: '' }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setMainImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAdditionalImagesDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleAdditionalImagesDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        processAdditionalImages(files);
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processAdditionalImages(files);
    };

    const processAdditionalImages = (files: File[]) => {
        const validFiles = files.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                setFormErrors((prev) => ({
                    ...prev,
                    additionalImages: 'Each additional image must be less than 5MB',
                }));
                return false;
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setFormErrors((prev) => ({
                    ...prev,
                    additionalImages: 'Additional images must be PNG or JPEG',
                }));
                return false;
            }
            return true;
        });

        if (additionalImages.length + validFiles.length + additionalImagesPreviews.length > MAX_ADDITIONAL_IMAGES) {
            setFormErrors((prev) => ({
                ...prev,
                additionalImages: `You can upload up to ${MAX_ADDITIONAL_IMAGES} additional images`,
            }));
            return;
        }

        setAdditionalImages((prev) => [...prev, ...validFiles]);
        setFormErrors((prev) => ({ ...prev, additionalImages: '' }));

        const newActions = validFiles.map((file) => ({
            key: `new-${Date.now()}-${Math.random()}`,
            action: 'add',
            newFileName: file.name,
        }));

        setAdditionalImageActions((prev) => [...prev, ...newActions]);

        const previews = validFiles.map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previews).then((newPreviews) => {
            setAdditionalImagesPreviews((prev) => [...prev, ...newPreviews]);
        });
    };

    const handleDeleteAdditionalImage = (index: number) => {
        const action = additionalImageActions[index];
        if (action.action === 'add') {
            // Remove newly added image
            setAdditionalImages((prev) => prev.filter((_, i) => i !== index - (additionalImagesPreviews.length - prev.length)));
            setAdditionalImagesPreviews((prev) => prev.filter((_, i) => i !== index));
            setAdditionalImageActions((prev) => prev.filter((_, i) => i !== index));
        } else {
            // Mark existing image for deletion
            setAdditionalImageActions((prev) =>
                prev.map((act, i) =>
                    i === index ? { ...act, action: 'delete', newFileName: null } : act
                )
            );
            setAdditionalImagesPreviews((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmitUpdateDialog = async (id: string) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append(
                'data',
                new Blob(
                    [
                        JSON.stringify({
                            title: updateFormData.title,
                            description: updateFormData.description,
                            address: updateFormData.address,
                            tariffDescription: updateFormData.tariffDescription,
                            autoRenew: updateFormData.autoRenew,
                        }),
                    ],
                    { type: 'application/json' }
                )
            );

            if (mainImage && mainImageAction) {
                formDataToSend.append('mainImageAction', mainImageAction);
                formDataToSend.append('mainImageFile', mainImage);
            }

            if (additionalImageActions.length > 0) {
                formDataToSend.append(
                    'additionalImageActions',
                    new Blob([JSON.stringify(additionalImageActions)], { type: 'application/json' })
                );
            }

            additionalImages.forEach((image) => {
                formDataToSend.append('additionalImageFiles', image);
            });

            await authoredApi.patch(`/rentalListings/${id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            handleClose();
            initializeRentalListings();
            setUpdateFormData({
                id: '',
                title: '',
                description: '',
                address: '',
                tariffDescription: '',
                autoRenew: false,
            });
            setMainImage(null);
            setMainImagePreview(null);
            setMainImageAction(null);
            setAdditionalImages([]);
            setAdditionalImagesPreviews([]);
            setAdditionalImageActions([]);
        } catch (error) {
            console.error('Error updating rental listing:', error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Update Rental Listing</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: formErrors.mainImage ? 'error.main' : 'grey.500',
                            borderRadius: 2,
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            minHeight: '100px',
                        }}
                        onDragOver={handleMainImageDragOver}
                        onDrop={handleMainImageDrop}
                    >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {mainImage ? `New Main Image: ${mainImage.name}` : mainImagePreview ? 'Current Main Image' : 'Drag and drop main image here'}
                        </Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: 'none' }}>
                            Choose Main Image
                            <input
                                type="file"
                                hidden
                                accept="image/png,image/jpeg"
                                onChange={handleMainImageChange}
                            />
                        </Button>
                        {formErrors.mainImage && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {formErrors.mainImage}
                            </Typography>
                        )}
                        {mainImagePreview && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <img
                                    src={mainImagePreview}
                                    alt="Main image preview"
                                    style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: formErrors.additionalImages ? 'error.main' : 'grey.500',
                            borderRadius: 2,
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            minHeight: '100px',
                        }}
                        onDragOver={handleAdditionalImagesDragOver}
                        onDrop={handleAdditionalImagesDrop}
                    >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {additionalImages.length > 0
                                ? `New Additional Images: ${additionalImages.map((img) => img.name).join(', ')}`
                                : additionalImagesPreviews.length > 0
                                    ? 'Current Additional Images'
                                    : 'Drag and drop additional images here'}
                        </Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: 'none' }}>
                            Choose Additional Images
                            <input
                                type="file"
                                hidden
                                accept="image/png,image/jpeg"
                                multiple
                                onChange={handleAdditionalImagesChange}
                            />
                        </Button>
                        {formErrors.additionalImages && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {formErrors.additionalImages}
                            </Typography>
                        )}
                        {additionalImagesPreviews.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {additionalImagesPreviews.map((preview, index) => (
                                    <Box key={index} sx={{ position: 'relative' }}>
                                        <img
                                            src={preview}
                                            alt={`Additional image ${index + 1}`}
                                            style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }}
                                        />
                                        <IconButton
                                            sx={{ position: 'absolute', top: 0, right: 0 }}
                                            onClick={() => handleDeleteAdditionalImage(index)}
                                        >
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <TextField
                        label="Title"
                        name="title"
                        value={updateFormData.title}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        required
                        error={!!formErrors.title}
                        helperText={formErrors.title}
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={updateFormData.description}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        multiline
                        rows={3}
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                    />
                    <TextField
                        label="Address"
                        name="address"
                        value={updateFormData.address}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        required
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                    />
                    <TextField
                        label="Tariff Description"
                        name="tariffDescription"
                        value={updateFormData.tariffDescription}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        required
                        error={!!formErrors.tariffDescription}
                        helperText={formErrors.tariffDescription}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={updateFormData.autoRenew}
                                onChange={handleSwitchChangeUpdateDialog}
                                name="autoRenew"
                            />
                        }
                        label="Auto Renew"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={() => handleSubmitUpdateDialog(updateFormData.id)}
                    variant="contained"
                    color="primary"
                >
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RentalListingEditDialog;