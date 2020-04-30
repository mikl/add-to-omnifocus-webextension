function composeOmniFocusAddTaskUrl(parameters) {
  const parts = Object.entries(parameters).map(
    ([key, value]) => `${key}=${encodeURIComponent(value)}`
  )

  return `omnifocus:///add?${parts.join('&')}`
}

async function handleBrowserActionClick() {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  })

  if (tabs.length > 0) {
    const activeTab = tabs[0]

    const addTaskUrl = composeOmniFocusAddTaskUrl(
      {
      name: activeTab.title,
      note: activeTab.url
      }
    )

    await openOmniFocusUrl(addTaskUrl)

    console.info(`Added task “${activeTab.title}” to OmniFocus.`)
  } else {
    console.error('Browser tabs query returned empty set, cannot add OmniFocus task.')
  }
}

function openOmniFocusUrl(url) {
  // This is a little gross, but I haven’t been able to find a neater way to
  // open the OmniFocus URL, and this appears to have no side effects.
  location = url
}

browser.browserAction.onClicked.addListener(handleBrowserActionClick)
