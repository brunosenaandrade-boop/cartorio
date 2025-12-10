export const Colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3182ce',
    600: '#2c5282',
    700: '#1a365d',
    800: '#1e3a5f',
    900: '#0f172a',
  },
  accent: {
    400: '#ecc94b',
    500: '#d69e2e',
    600: '#b7791f',
  },
  success: {
    100: '#dcfce7',
    500: '#38a169',
    600: '#2f855a',
    700: '#15803d',
  },
  danger: {
    100: '#fee2e2',
    500: '#e53e3e',
    600: '#c53030',
    700: '#b91c1c',
  },
  warning: {
    100: '#fef3c7',
    500: '#dd6b20',
    600: '#c05621',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
}

export const StatusColors = {
  agendado: {
    bg: Colors.primary[100],
    text: Colors.primary[700],
  },
  concluido: {
    bg: Colors.success[100],
    text: Colors.success[700],
  },
  cancelado: {
    bg: Colors.danger[100],
    text: Colors.danger[700],
  },
}
