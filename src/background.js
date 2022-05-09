function composeOmniFocusAddTaskUrl(parameters) {
  const parts = Object.entries(parameters).map(
    ([key, value]) => `${key}=${encodeURIComponent(value)}`
  )

  return `omnifocus:///add?${parts.join('&')}`
}

function composeMultiLineNote(parts) {
  return parts.join('\n')
}

async function handleBrowserActionClick() {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  })

  if (tabs.length > 0) {
    const activeTab = tabs[0]

    const selection = (await browser.tabs.executeScript({
      code: `window.getSelection().toString()`
    })).join('\n')

    let note = activeTab.url

    if (selection) {
      note = note.concat("\n\n", selection)
    }

    const addTaskUrl = composeOmniFocusAddTaskUrl({
      name: activeTab.title,
      note
    })

    openOmniFocusUrl(addTaskUrl, activeTab)

    console.info(browser.i18n.getMessage('infoTaskSent', [activeTab.title]))
  } else {
    console.error(browser.i18n.getMessage('errorEmptyTabSet'))
  }
}

function handleMenuClick(info, tab) {
  switch (info.menuItemId) {
    case 'add-to-omnifocus-link':
      handleMenuClickForLink(info, tab)
  }
}

function handleMenuClickForLink({ linkText, linkUrl, pageUrl }, tab) {
  const addTaskUrl = composeOmniFocusAddTaskUrl({
    name: linkText,
    note: composeMultiLineNote([
      browser.i18n.getMessage('urlDesignation', [linkUrl]),
      '',
      browser.i18n.getMessage('fromUrlDesignation', [pageUrl])
    ])
  })

  openOmniFocusUrl(addTaskUrl, tab)

  console.info(browser.i18n.getMessage('infoTaskSent', [linkText]))
}

function openOmniFocusUrl(url, tab) {
  // This is a little gross, but I haven’t been able to find a neater way to
  // open the OmniFocus URL, and this appears to have no side effects.
  browser.tabs.update(tab.id, { url })
}

browser.browserAction.onClicked.addListener(handleBrowserActionClick)

browser.menus.create({
  id: 'add-to-omnifocus-link',
  title: browser.i18n.getMessage('menuAddLinkToOmniFocus'),
  contexts: ['link']
})

browser.menus.onClicked.addListener(handleMenuClick)
