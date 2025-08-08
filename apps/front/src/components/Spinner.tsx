import { FC } from "react";

interface Props {
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const sizeMap = {
    xs: "loading-xs",
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
};

const Spinner: FC<Props> = ({ size = "lg", className = "" }) => (
    <div className={`flex justify-center items-center ${className}`}>
        <span className={`loading loading-spinner ${sizeMap[size]}`} />
    </div>
);

export default Spinner;
