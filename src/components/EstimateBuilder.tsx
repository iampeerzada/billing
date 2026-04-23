import React from 'react';
import { InvoiceBuilder } from './InvoiceBuilder';

interface EstimateBuilderProps {
  onCancel?: () => void;
}

export function EstimateBuilder({ onCancel }: EstimateBuilderProps) {
  return <InvoiceBuilder type="estimate" onCancel={onCancel} />;
}
