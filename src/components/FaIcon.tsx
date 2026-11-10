import React from 'react';

interface FaIconProps {
  icon: string;
  className?: string;
  title?: string;
}

export const FaIcon: React.FC<FaIconProps> = ({ icon, className = '', title }) => {
  return <i className={`${icon} ${className}`} title={title} aria-hidden="true"></i>;
};
