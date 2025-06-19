import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

const FormField = ({ 
  type = 'input',
  label,
  error,
  required = false,
  ...props 
}) => {
  const labelWithRequired = required && label ? `${label} *` : label;

  if (type === 'select') {
    return (
      <Select
        label={labelWithRequired}
        error={error}
        {...props}
      />
    );
  }

  return (
    <Input
      type={type}
      label={labelWithRequired}
      error={error}
      {...props}
    />
  );
};

export default FormField;