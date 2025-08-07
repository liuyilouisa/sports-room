import { FC, ReactNode } from "react";

interface Props {
    text?: ReactNode;
    className?: string;
}

const Empty: FC<Props> = ({ text = "暂无数据", className = "" }) => (
    <div className={`text-center py-16 ${className}`}>
        <p className="text-gray-500">{text}</p>
    </div>
);

export default Empty;
