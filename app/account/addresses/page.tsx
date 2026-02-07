import { AddressesClient } from '@/components/account/addresses-client';
import type { UserAddress } from '@/types/user';

// Mock addresses data - In production, fetch from database
const mockAddresses: UserAddress[] = [
  {
    id: '1',
    type: 'shipping',
    isDefault: true,
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Corp',
    addressLine1: '123 Beauty Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    type: 'billing',
    isDefault: true,
    firstName: 'John',
    lastName: 'Doe',
    company: '',
    addressLine1: '123 Beauty Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '3',
    type: 'shipping',
    isDefault: false,
    firstName: 'Jane',
    lastName: 'Doe',
    company: '',
    addressLine1: '456 Fashion Avenue',
    addressLine2: '',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90210',
    country: 'United States',
    phone: '+1 (555) 987-6543'
  }
];

export default async function AddressesPage() {
  // In production, fetch addresses from database using user ID
  // const addresses = await getUserAddresses(userId);
  const addresses = mockAddresses;

  return <AddressesClient initialAddresses={addresses} />;
}
