import styled, { css } from 'styled-components';

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

export const Label = styled.label<{ required?: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: ${props.theme.colors.error[500]};
    }
  `}
`;

export const Input = styled.input<{ error?: boolean; variant?: 'default' | 'filled' }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error ? props.theme.colors.error[300] : props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  background: ${props => props.variant === 'filled' ? props.theme.colors.background.secondary : props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  transition: all ${props => props.theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.error[500] : props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.error ? props.theme.colors.error[100] : props.theme.colors.primary[100]};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.tertiary};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

export const Select = styled.select<{ error?: boolean }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error ? props.theme.colors.error[300] : props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  transition: all ${props => props.theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.error[500] : props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.error ? props.theme.colors.error[100] : props.theme.colors.primary[100]};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.tertiary};
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea<{ error?: boolean; resize?: boolean }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error ? props.theme.colors.error[300] : props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  transition: all ${props => props.theme.transitions.normal};
  min-height: 100px;
  resize: ${props => props.resize ? 'vertical' : 'none'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.error[500] : props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.error ? props.theme.colors.error[100] : props.theme.colors.primary[100]};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.tertiary};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

export const ErrorMessage = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.error[600]};
  margin-top: ${props => props.theme.spacing.xs};
`;

export const HelpText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing.xs};
`;

export const FormRow = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })<{ error?: boolean }>`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.primary[500]};
  cursor: pointer;
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

export const Radio = styled.input.attrs({ type: 'radio' })`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.primary[500]};
  cursor: pointer;
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

export const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;