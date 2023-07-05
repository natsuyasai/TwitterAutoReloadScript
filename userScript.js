// ==UserScript==
// @name         twitter自動読み込み
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description
// @author       natsuyasai
// @match        https://twitter.com/home
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

const BUTTON_ELEMENT_ROOT_ID = "userscript-button-container";
const BUTTON_ID = "userscript-auto-reload-button";
const SELECLTED_ELEMENT_ROOT_ID = "userscript-selected-container";
const SELECTED_LIST_ID = "userscript-interval-setting";

/**
 * スタイル適用
 */
function addStyle() {
  const css = `
#${BUTTON_ID} {
  position: fixed;
  top: 0;
  left: 0;
  width: 44px;
  height: 20px;
  margin: 0.3em;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  border: none;
  text-align: center;
  background-color: #03A9F4;
  color: white;
}
#${BUTTON_ID} :hover {
  box-shadow: 1px 6px 15px rgba(0,0,0,0.5);
}

#${BUTTON_ID}:focus {
  outline: none;
}

#${SELECTED_LIST_ID} {
  position: fixed;
  top: 0;
  left: 54px;
  height: 20px;
  margin: 0.3em;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  border: none;
  text-align: center;
  background-color: #03A9F4;
  color: white;
}
`;
  const styleElement = document.createElement("style");
  styleElement.innerHTML = css;
  document.head.append(styleElement);
}

/**
 * 切り替えボタン追加
 */
function addSwithButton() {
  const buttonArea = document.createElement("div");
  buttonArea.innerHTML = `<button id="${BUTTON_ID}" type="button">OFF</button>`
  buttonArea.setAttribute("id", BUTTON_ELEMENT_ROOT_ID);
  const mainElement = document.getElementsByTagName("main");
  if (mainElement.length > 0) {
    mainElement[0].appendChild(buttonArea);
  } else {
    document.body.appendChild(buttonArea);
  }

  const button = document.getElementById(BUTTON_ID);
  button.addEventListener("click", () => {
    isStart = !isStart;
    button.textContent = isStart ? "OFF" : "ON";
    alert(isStart ? "自動読み込みを開始します" : "自動読み込みを停止します");
  }, false);
}

/**
 * 読み込み周期設定追加
 */
function addIntervalSetting() {
  const IntervalSecond = Object.freeze({
    0: 5,
    1: 10,
    2: 15,
    3: 30,
    4: 45,
    5: 60,
    6: 120,
    7: 180,
  });
  const selectedListArea = document.createElement("div");
  selectedListArea.innerHTML = `
  <select  id="${SELECTED_LIST_ID}" name="setting" size="1">
      <option value="0">5秒</option>
      <option value="1">10秒</option>
      <option value="2">15秒</option>
      <option value="3"> 30秒</option>
      <option value="4"> 45秒</option>
      <option value="5" selected> 1分</option>
      <option value="6"> 2分</option>
      <option value="7"> 3分</option>
  </select>`
  selectedListArea.setAttribute("id", SELECLTED_ELEMENT_ROOT_ID);
  const mainElement = document.getElementsByTagName("main");
  if (mainElement.length > 0) {
    mainElement[0].appendChild(selectedListArea);
  } else {
    document.body.appendChild(selectedListArea);
  }

  const listElement = document.getElementById(SELECTED_LIST_ID);
  listElement.addEventListener("change", (event) => {
    const value = parseInt(event.currentTarget.value, 10);
    const intervalSecond = IntervalSecond[value];
    restartInterval(intervalSecond);
  }, false);
}

/**
 * メイン処理
 */
function reSelectTab() {
  // aタグの中からタグ要素かつ現在アクティブになっている要素を取得し、クリックイベントを発火させる
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

/**
 * スクロールしているか
 * @returns 
 */
function isScrolling() {
  return document.scrollingElement.scrollTop > 0;
}

/**
 * 周期リセット
 * @param {*} intervalSecond 
 */
function restartInterval(intervalSecond) {
  if (timerId > 0) {
    clearInterval(timerId);
  }
  timerId = setInterval(() => {
    // 停止またはスクロール中なら処理しない
    if (isStart && !isScrolling()) {
      reSelectTab();
    }
  }, 1000 * intervalSecond);
}

let isStart = true;
let timerId = -1;
(function () {
  'use strict';
  addSwithButton();
  addIntervalSetting();
  addStyle();
  restartInterval(60);
})();
