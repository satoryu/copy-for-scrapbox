import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    manifest_version: 3,
    permissions: [ 'tabs', 'contextMenus', 'scripting' ],
    host_permissions: [
      'https://*/*'
    ],
    web_accessible_resources: [
      {
        'resources': [ 'src/*.js' ],
        'matches': [ '<all_urls>' ]
      }
    ]
  }
});
