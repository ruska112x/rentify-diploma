import React from "react";
import { IMaskInput } from "react-imask";

export const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const PhoneMaskInput = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="+{7} (000) 000-0000"
            inputRef={ref}
            onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

export default PhoneMaskInput;