import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none';
  
  // Size styles
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  }[size];
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white',
    outline: 'bg-transparent border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white',
  }[variant];
  
  const combinedClassName = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`;
  
  return (
    <button
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 