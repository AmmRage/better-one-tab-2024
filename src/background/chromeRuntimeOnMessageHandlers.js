let nightmode = false;
let drawer = false;
let appTabId = {};
let update = '';






chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // get value
    if (message.type === 'getBackgroundPage') {
        if (message.data.type === 'nightmode') {
            sendResponse({nightmode: nightmode});
        }
        else if (message.data.type === 'drawer') {
            sendResponse({drawer: drawer});
        }
        else if (message.data.type === 'appTabId') {
            sendResponse({appTabId: appTabId});
        }
        else if (message.data.type === 'update') {
            sendResponse({update: update});
        }
    }
    // set value
    else if (message.type === 'setBackgroundPage') {
        if (message.data.type === 'nightmode') {
            nightmode = message.data.value;
        }
        else if (message.data.type === 'drawer') {
            drawer = message.data.value;
        }
        else if (message.data.type === 'appTabId') {
            appTabId = message.data.value;
        }
        else if (message.data.type === 'update') {
            update = message.data.value;
        }
    }
    return true;
  });


  const chromeRuntimeOnMessageHandlersInit = () => {
    console.log('chromeRuntimeOnMessageHandlersInit')
  }

  export default chromeRuntimeOnMessageHandlersInit;