import React from 'react';
import { InvoiceBuilder } from './InvoiceBuilder';

interface CreditDebitNoteBuilderProps {
  onCancel?: () => void;
}

export function CreditDebitNoteBuilder({ onCancel }: CreditDebitNoteBuilderProps) {
  return <InvoiceBuilder type="credit-debit" onCancel={onCancel} />;
}
