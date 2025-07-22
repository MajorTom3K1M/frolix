import { Button, SxProps } from "@mui/material";

interface BoardActionButtonProps {
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    ariaLabel?: string;
    sx?: SxProps;
    variant?: 'text' | 'outlined' | 'contained'
}

const BoardActionButton = ({
    onClick,
    icon,
    disabled = false,
    ariaLabel,
    sx,
    variant = 'outlined',
}: BoardActionButtonProps) => (
    <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        sx={{
            minWidth: 50,
            height: 50,
            borderRadius: 2,
            backgroundColor: '#f5f5f5',
            p: 0,
            ...sx,
        }}
    >
        {icon}
    </Button>
);

export default BoardActionButton;