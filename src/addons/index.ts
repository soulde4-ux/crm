import type { Addon } from '../infra/addons';

// Placeholder local addons file for development.
// Drop your local addons here by exporting a default array of Addon objects.
// Example:
// export default [{ id: 'my.addon', name: 'My Addon', description: '...' }]

const localAddons: Addon[] = [
  {
    id: 'local.example',
    name: 'Local Example Addon',
    description: 'A placeholder local addon for development and testing.',
    icon: '',
    init: () => {
      // any setup side effects for the addon can go here
      // keep things lightweight for local dev
      // eslint-disable-next-line no-console
      console.log('Local Example Addon initialized');
    },
  },
];

export default localAddons;
