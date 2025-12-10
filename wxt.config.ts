import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    manifest_version: 3,
    permissions: [ 'tabs', 'contextMenus', 'scripting', 'storage', 'sidePanel' ],
    host_permissions: [
      'https://*/*'
    ],
    default_locale: 'en',
    web_accessible_resources: [
      {
        'resources': [ 'src/*.js' ],
        'matches': [ '<all_urls>' ]
      }
    ]
  }
});
