import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  describe('rendering', () => {
    it('renders label text correctly', () => {
      render(
        <FormField label="Username">
          <input type="text" />
        </FormField>
      );
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <FormField label="Email">
          <input type="email" placeholder="Enter email" />
        </FormField>
      );
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('renders label as a label element', () => {
      render(
        <FormField label="Password">
          <input type="password" />
        </FormField>
      );
      const label = screen.getByText('Password');
      expect(label.tagName).toBe('LABEL');
    });

    it('wraps content in a div container', () => {
      render(
        <FormField label="Field">
          <input type="text" data-testid="input" />
        </FormField>
      );
      const input = screen.getByTestId('input');
      const container = input.parentElement;
      expect(container.tagName).toBe('DIV');
    });
  });

  describe('different child types', () => {
    it('renders text input', () => {
      render(
        <FormField label="Name">
          <input type="text" data-testid="text-input" />
        </FormField>
      );
      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });

    it('renders select dropdown', () => {
      render(
        <FormField label="Country">
          <select data-testid="select">
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
          </select>
        </FormField>
      );
      expect(screen.getByTestId('select')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    it('renders textarea', () => {
      render(
        <FormField label="Description">
          <textarea data-testid="textarea" />
        </FormField>
      );
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    it('renders checkbox', () => {
      render(
        <FormField label="Accept Terms">
          <input type="checkbox" data-testid="checkbox" />
        </FormField>
      );
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    it('renders radio buttons', () => {
      render(
        <FormField label="Gender">
          <div>
            <input type="radio" name="gender" value="male" data-testid="radio-male" /> Male
            <input type="radio" name="gender" value="female" data-testid="radio-female" /> Female
          </div>
        </FormField>
      );
      expect(screen.getByTestId('radio-male')).toBeInTheDocument();
      expect(screen.getByTestId('radio-female')).toBeInTheDocument();
    });

    it('renders color picker', () => {
      render(
        <FormField label="Favorite Color">
          <input type="color" data-testid="color-input" />
        </FormField>
      );
      expect(screen.getByTestId('color-input')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <FormField label="Date Range">
          <input type="date" data-testid="start-date" />
          <span> to </span>
          <input type="date" data-testid="end-date" />
        </FormField>
      );
      expect(screen.getByTestId('start-date')).toBeInTheDocument();
      expect(screen.getByTestId('end-date')).toBeInTheDocument();
      expect(screen.getByText('to')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies margin-bottom to container', () => {
      render(
        <FormField label="Test">
          <input type="text" data-testid="input" />
        </FormField>
      );
      const input = screen.getByTestId('input');
      // Container is the outermost div (input's parent is childWrapper, childWrapper's parent is container)
      const container = input.parentElement.parentElement;
      expect(container).toHaveStyle({ marginBottom: '20px' });
    });

    it('applies display block to label', () => {
      render(
        <FormField label="Test Label">
          <input type="text" />
        </FormField>
      );
      const label = screen.getByText('Test Label');
      expect(label).toHaveStyle({ display: 'block' });
    });

    it('applies font-weight 500 to label', () => {
      render(
        <FormField label="Bold Label">
          <input type="text" />
        </FormField>
      );
      const label = screen.getByText('Bold Label');
      expect(label).toHaveStyle({ fontWeight: '500' });
    });
  });

  describe('label content', () => {
    it('renders emoji in label', () => {
      render(
        <FormField label="📧 Email Address">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText('📧 Email Address')).toBeInTheDocument();
    });

    it('renders long label text', () => {
      const longLabel = 'This is a very long label that describes the field in great detail';
      render(
        <FormField label={longLabel}>
          <input type="text" />
        </FormField>
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('renders label with special characters', () => {
      render(
        <FormField label="Interest Rate (%)">
          <input type="number" />
        </FormField>
      );
      expect(screen.getByText('Interest Rate (%)')).toBeInTheDocument();
    });

    it('renders label with HTML entities', () => {
      render(
        <FormField label="Name & Title">
          <input type="text" />
        </FormField>
      );
      expect(screen.getByText('Name & Title')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty label', () => {
      render(
        <FormField label="">
          <input type="text" data-testid="input" />
        </FormField>
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(
        <FormField label="Empty Field">
          {null}
        </FormField>
      );
      expect(screen.getByText('Empty Field')).toBeInTheDocument();
    });

    it('handles nested components as children', () => {
      const CustomInput = () => <input type="text" data-testid="custom-input" />;
      render(
        <FormField label="Custom">
          <CustomInput />
        </FormField>
      );
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    });
  });
});
