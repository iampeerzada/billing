import React from 'react';
import { InvoiceBuilder } from './InvoiceBuilder';

interface PurchaseBillBuilderProps {
  onCancel?: () => void;
}

export function PurchaseBillBuilder({ onCancel }: PurchaseBillBuilderProps) {
  return <InvoiceBuilder type="purchase" onCancel={onCancel} />;
}
