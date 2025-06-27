import styled from 'styled-components';

export const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.primary} 0%, ${props => props.theme.colors.background.secondary} 100%);
  font-family: ${props => props.theme.typography.fontFamily.primary};
  color: ${props => props.theme.colors.text.primary};
`;

export const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md};
  }
`;

export const ContentSection = styled.section`
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.lg};
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

export const FlexContainer = styled.div<{
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap ? props.theme.spacing[props.gap] : props.theme.spacing.md};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

export const Grid = styled.div<{
  columns?: number;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: ${props => props.gap ? props.theme.spacing[props.gap] : props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div<{
  elevated?: boolean;
  interactive?: boolean;
}>`
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.lg};
  
  ${props => props.elevated && `
    box-shadow: ${props.theme.shadows.md};
  `}
  
  ${props => props.interactive && `
    cursor: pointer;
    transition: all ${props.theme.transitions.normal};
    
    &:hover {
      box-shadow: ${props.theme.shadows.lg};
      transform: translateY(-2px);
      border-color: ${props.theme.colors.primary[300]};
    }
  `}
`;

export const PageHeader = styled.header`
  margin-bottom: ${props => props.theme.spacing['2xl']};
  text-align: center;
`;

export const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[600]} 0%, ${props => props.theme.colors.secondary[600]} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, ${props => props.theme.colors.border.medium}, transparent);
  margin: ${props => props.theme.spacing.xl} 0;
`;