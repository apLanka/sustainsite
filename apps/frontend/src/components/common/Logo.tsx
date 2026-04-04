// import React removed

interface LogoProps {
  /** Size preset for the logo image */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Additional classes for the container */
  className?: string;
  /** Whether the logo is on a dark or light background */
  variant?: 'light' | 'dark';
  /** Whether to show the "SustainSite" text next to the logo */
  showText?: boolean;
}

const Logo = ({ 
  size = 'md', 
  className = '', 
  variant = 'light',
  showText = true 
}: LogoProps) => {
  // Height mappings based on size presets
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-16',
    '2xl': 'h-24',
    '3xl': 'h-32',
  };

  // Text size mappings based on size presets
  const textClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl',
    '3xl': 'text-6xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      <img 
        src="/logo/logo.png" 
        alt="SustainSite Logo" 
        className={`${sizeClasses[size]} w-auto object-contain transition-transform duration-300`}
      />
      {showText && (
        <span 
          className={`
            font-headline font-extrabold tracking-tighter leading-none 
            ${textClasses[size]} 
            ${variant === 'dark' ? 'text-white' : 'text-primary'}
          `}
        >
          SustainSite
        </span>
      )}
    </div>
  );
};

export default Logo;
