import styled, { css } from 'styled-components';

export const TabContainer = styled.nav`
  display: flex;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border.light};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

export const Tab = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  ${props => props.active ? css`
    background: linear-gradient(135deg, ${props.theme.colors.primary[500]} 0%, ${props.theme.colors.primary[600]} 100%);
    color: ${props.theme.colors.text.inverse};
    box-shadow: ${props.theme.shadows.md};
    transform: translateY(-1px);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    }
  ` : css`
    background: transparent;
    color: ${props.theme.colors.text.secondary};
    
    &:hover {
      background: ${props.theme.colors.primary[50]};
      color: ${props.theme.colors.primary[700]};
      transform: translateY(-1px);
    }
  `}
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: -2px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    margin-bottom: ${props => props.theme.spacing.xs};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const NavigationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

export const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

export const BreadcrumbItem = styled.span<{ active?: boolean }>`
  ${props => props.active ? css`
    color: ${props.theme.colors.primary[600]};
    font-weight: ${props.theme.typography.fontWeight.medium};
  ` : css`
    color: ${props.theme.colors.text.tertiary};
  `}
`;

export const BreadcrumbSeparator = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  user-select: none;
`;