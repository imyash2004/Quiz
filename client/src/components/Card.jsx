import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'rounded-xl shadow-md p-6';
  
  const variantClasses = {
    default: 'bg-white',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    accent: 'bg-accent text-white',
    outline: 'bg-white border-2 border-gray-200',
  };
  
  const hoverClasses = hover ? 'transition-transform duration-300 hover:scale-105 hover:shadow-lg' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
