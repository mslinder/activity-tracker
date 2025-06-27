import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
}

const getButtonStyles = (variant: ButtonVariant, theme: any) => {
  const variants = {
    primary: css`
      background: linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%);
      color: ${theme.colors.text.inverse};
      border: 1px solid ${theme.colors.primary[500]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%);
        border-color: ${theme.colors.primary[600]};
        transform: translateY(-1px);
        box-shadow: ${theme.shadows.md};
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: ${theme.shadows.sm};
      }
    `,
    secondary: css`
      background: ${theme.colors.background.primary};
      color: ${theme.colors.primary[600]};
      border: 1px solid ${theme.colors.primary[300]};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.primary[50]};
        border-color: ${theme.colors.primary[400]};
        transform: translateY(-1px);
        box-shadow: ${theme.shadows.sm};
      }
    `,
    success: css`
      background: linear-gradient(135deg, ${theme.colors.success[500]} 0%, ${theme.colors.success[600]} 100%);
      color: ${theme.colors.text.inverse};
      border: 1px solid ${theme.colors.success[500]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${theme.colors.success[600]} 0%, ${theme.colors.success[700]} 100%);
        transform: translateY(-1px);
        box-shadow: ${theme.shadows.md};
      }
    `,
    warning: css`
      background: linear-gradient(135deg, ${theme.colors.warning[500]} 0%, ${theme.colors.warning[600]} 100%);
      color: ${theme.colors.text.inverse};
      border: 1px solid ${theme.colors.warning[500]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${theme.colors.warning[600]} 0%, ${theme.colors.warning[700]} 100%);
        transform: translateY(-1px);
        box-shadow: ${theme.shadows.md};
      }
    `,
    error: css`
      background: linear-gradient(135deg, ${theme.colors.error[500]} 0%, ${theme.colors.error[600]} 100%);
      color: ${theme.colors.text.inverse};
      border: 1px solid ${theme.colors.error[500]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${theme.colors.error[600]} 0%, ${theme.colors.error[700]} 100%);
        transform: translateY(-1px);
        box-shadow: ${theme.shadows.md};
      }
    `,
    ghost: css`
      background: transparent;
      color: ${theme.colors.text.secondary};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        background: ${theme.colors.neutral[100]};
        color: ${theme.colors.text.primary};
      }
    `,
  };
  
  return variants[variant];
};

const getSizeStyles = (size: ButtonSize, theme: any) => {
  const sizes = {
    sm: css`
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
      font-size: ${theme.typography.fontSize.sm};
      min-height: 32px;
    `,
    md: css`
      padding: ${theme.spacing.sm} ${theme.spacing.md};
      font-size: ${theme.typography.fontSize.base};
      min-height: 40px;
    `,
    lg: css`
      padding: ${theme.spacing.md} ${theme.spacing.lg};
      font-size: ${theme.typography.fontSize.lg};
      min-height: 48px;
    `,
  };
  
  return sizes[size];
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  white-space: nowrap;
  user-select: none;
  outline: none;
  
  ${props => getButtonStyles(props.variant || 'primary', props.theme)}
  ${props => getSizeStyles(props.size || 'md', props.theme)}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const IconButton = styled(Button)`
  padding: ${props => props.theme.spacing.sm};
  min-width: auto;
  
  ${props => props.size === 'sm' && css`
    padding: ${props.theme.spacing.xs};
  `}
  
  ${props => props.size === 'lg' && css`
    padding: ${props.theme.spacing.md};
  `}
`;

export const ButtonGroup = styled.div<{ orientation?: 'horizontal' | 'vertical' }>`
  display: flex;
  flex-direction: ${props => props.orientation === 'vertical' ? 'column' : 'row'};
  
  ${Button} {
    ${props => props.orientation === 'vertical' ? css`
      &:not(:first-child) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-top: none;
      }
      
      &:not(:last-child) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    ` : css`
      &:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
      }
      
      &:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    `}
  }
`;