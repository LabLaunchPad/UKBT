import { describe, expect, it } from 'vitest';
import { submitForm } from './submit-form';

const app = {
  fullName: 'A Player',
  dateOfBirth: '2008-04-01',
  nationality: 'British',
  countryOfResidency: 'United Kingdom',
  phone: '+447700900000',
  email: 'a@example.com',
};

describe('submitForm with the mock adapter', () => {
  it('reports unavailable and never claims success', async () => {
    expect(await submitForm(app)).toEqual({ status: 'unavailable' });
  });
  it('never resolves ok in v1', async () => {
    expect((await submitForm(app)).status).not.toBe('ok');
  });
});
