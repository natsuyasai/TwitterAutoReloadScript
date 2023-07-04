// ==UserScript==
// @name         twitter自動読み込み
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description
// @author       natsuyasai
// @match        https://twitter.com/home
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

function addSwithButton() {
  const buttonArea = document.createElement("div");
  buttonArea.innerHTML = '<button id="userscript-auto-reload-button" type="button" style="position: absolute; top: 0; left: 0">ON</button>';
  buttonArea.setAttribute("id", "userscript-button-container");
  const mainElement = document.getElementsByTagName("main");
  if (mainElement.length > 0) {
    mainElement[0].appendChild(buttonArea);
  } else {
    document.body.appendChild(buttonArea);
  }

  const button = document.getElementById("userscript-auto-reload-button")
  button.addEventListener("click", () => {
    isStart = !isStart;
    button.textContent = isStart ? "OFF" : "OFF→ON";
    alert(isStart ? "自動読み込みを開始します" : "自動読み込みを停止します");
  }, false);
}

function addIntervalSetting() {

}

function reSelectTab() {
  const tab = document.getElementsByTagName("a");
  for (let i = 0; i < tab.length; i++) {
    const elem = tab[i];
    const isTab = elem.hasAttribute("role") && elem.getAttribute("role") === "tab";
    if (!isTab) {
      continue;
    }
    const isSelectedTabElement = elem.hasAttribute("aria-selected") && elem.getAttribute("aria-selected") === "true";
    if (!isSelectedTabElement) {
      continue;
    }
    elem.click();
  }
}
let isStart = true;
let timerId = -1;
(function () {
  'use strict';
  addSwithButton();
  timerId = setInterval(() => {
    if (isStart) {
      reSelectTab();
    }
  }, 1000 * 30);
})();
