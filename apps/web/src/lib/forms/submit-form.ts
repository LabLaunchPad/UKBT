import { mockAdapter } from './adapters/mock';

/** The application-form payload the UI collects. Provider-agnostic on purpose. */
export type JoinApplication = {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidency: string;
  phone: string;
  email: string;
  statisticsUrl?: string;
  videoUrls?: string[];
  /** Required consent + age-attestation ticks. Carried so a later adapter
      can persist the fact of consent, not just the application fields. */
  consent: boolean;
  ageAttestation: boolean;
};

/** Discriminated union — consumers narrow on `status`. */
export type FormResult =
  | { status: 'ok' }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

// FORM-CONTRACT.md (FROZEN): the UI depends only on
// `submitForm(payload): Promise<Result>`. Swapping the adapter changes
// delivery, never the UI or this signature. No provider/Cloudflare type is
// imported anywhere in this module — that is the contract's forbidden
// behavior.
export type FormAdapter = (payload: JoinApplication) => Promise<FormResult>;

let adapter: FormAdapter = mockAdapter;

export function submitForm(payload: JoinApplication): Promise<FormResult> {
  return adapter(payload);
}

export function setFormAdapter(next: FormAdapter): void {
  adapter = next;
}

export function resetFormAdapterForTests(): void {
  adapter = mockAdapter;
}
