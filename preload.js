/*// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
*/

function redirect(){window.location.href = 'https://client.cpatake.tk/';}
window.addEventListener('DOMContentLoaded', () => {
  var url = window.location.href;
    if(url.includes('waddlepenguins.tk') == false){redirect();}
  });