import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    style,
    ...props
}) => {
    const baseStyles = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

    const variantStyles = {
        text: "rounded",
        rectangular: "rounded-md",
        circular: "rounded-full"
    };

    const computedStyle: React.CSSProperties = {
        width: width,
        height: height,
        ...style
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={computedStyle}
            {...props}
        />
    );
};
