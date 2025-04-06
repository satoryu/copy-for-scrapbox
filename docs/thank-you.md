---
layout: page
title: Thank You for Using Copy for Scrapbox!
---

# Thank you for Using Copy for Scrapbox!

We are sorry to see you go! Your feedback is important to us.
Please take a moment to let us know why you decided to uninstall the extension.

- [GitHub Issues](https://github.com/satoryu/copy-for-scrapbox/issues)
- Email: satoryu.1981@gmail.com

Thank you for your time and feedback!

<script>
  const url = new URL(window.location.href)
  const userId = url.searchParams.get('userId')
  const clientId = url.searchParams.get('clientId')
  const version = url.searchParams.get('version')

  if (userId && clientId && version) {
    gtag('event', 'uninstalled', {
      client_id: clientId,
      user_id: userId,
      version
    })
  }
</script>
