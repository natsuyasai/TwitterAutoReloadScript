// ==UserScript==
// @name         Twitter autoload
// @namespace    https://github.com/natsuyasai/TwitterAutoReloadScript
// @version      1.1.0
// @description  Automatically retrieve the latest Tweet(X's).
// @author       natsuyasai
// @match        https://twitter.com/home
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @updateURL    https://github.com/natsuyasai/TwitterAutoReloadScript/blob/main/TwitterAutoReload.user.js
// @downloadURL  https://github.com/natsuyasai/TwitterAutoReloadScript/blob/main/TwitterAutoReload.user.js
// @supportURL   https://github.com/natsuyasai/TwitterAutoReloadScript
// @license MIT
// ==/UserScript==
'use strict';

const ROOT_CONTAINER = 'userscript-root-container';
const BUTTON_ELEMENT_ROOT_ID = 'userscript-button-container';
const BUTTON_ID = 'userscript-auto-reload-button';
const SELECLTED_ELEMENT_ROOT_ID = 'userscript-selected-container';
const SELECTED_LIST_ID = 'userscript-interval-setting';
const STATUS_ELEMENT_ROOT_ID = 'userscript-status-container';
const STATUS_ID = 'userscript-auto-reload-status';

/**
 * スタイル適用
 */
function addStyle() {
  const css = `

#${ROOT_CONTAINER} {
  position: fixed;
  display: flex;
  top: 0;
  left: 0;
}

#${BUTTON_ELEMENT_ROOT_ID},
#${SELECLTED_ELEMENT_ROOT_ID},
#${STATUS_ELEMENT_ROOT_ID} {
  position: relative;
  display: flex;
  align-items: center;
  text-align: center;
}

#${STATUS_ID} {
  margin: 0 2px 0 4px;
  color: lightgreen;
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
  font-size: 32px;
  line-height: 1;
}

#${BUTTON_ID} {
  position: relative;
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
  cursor: pointer;
  transition: 0.3s;
}
#${BUTTON_ID}:hover {
  opacity: 0.7;
}

#${BUTTON_ID}:focus {
}

#${SELECTED_LIST_ID} {
  position: relative;
  height: 20px;
  margin: 0.3em;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  border: none;
  text-align: center;
  background-color: #03A9F4;
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

#${SELECTED_LIST_ID}:hover {
  opacity: 0.7;
}

`;
  const styleElement = document.createElement('style');
  styleElement.innerHTML = css;
  document.head.append(styleElement);
}

/**
 * ルート要素追加
 */
function addRootContainer() {
  const rootArea = document.createElement('div');
  rootArea.setAttribute('id', ROOT_CONTAINER);
  document.body.appendChild(rootArea);
}

/**
 * コンテンツ登録
 * @param {HTMLElement} element 追加要素
 */
function setContent(element) {
  const rootElement = document.getElementById(ROOT_CONTAINER);
  if (rootElement) {
    rootElement.appendChild(element);
  } else {
    document.body.appendChild(element);
  }
}

let visibility = true;
/**
 * ステータス表示追加
 */
function addStatus() {
  const statusArea = document.createElement('div');
  statusArea.setAttribute('id', STATUS_ELEMENT_ROOT_ID);
  statusArea.innerHTML = `<button id="${STATUS_ID}">●</button>`;
  setContent(statusArea);

  const status = document.getElementById(STATUS_ID);
  if (status) {
    status.addEventListener('click', () => {
      const button = document.getElementById(BUTTON_ELEMENT_ROOT_ID);
      const selecter = document.getElementById(SELECLTED_ELEMENT_ROOT_ID);

      if (button && selecter) {
        if (visibility) {
          button.style.display = 'none';
          selecter.style.display = 'none';
        } else {
          button.style.display = 'initial';
          selecter.style.display = 'initial';
        }
      }
      visibility = !visibility;
    }, false);
  }
}

/**
 * ステータス変更
 * @param {boolean} isStart ＯＮ状態か
 */
function changeStatus(isStart) {
  const statusElement = document.getElementById(STATUS_ID);
  if (!statusElement) {
    return;
  }
  if (isStart) {
    statusElement.style.color = 'lightgreen';
  } else {
    statusElement.style.color = 'lightgray';
  }
}


/**
 * 切り替えボタン追加
 */
function addSwithButton() {
  const buttonArea = document.createElement('div');
  buttonArea.setAttribute('id', BUTTON_ELEMENT_ROOT_ID);
  buttonArea.innerHTML = `<button id="${BUTTON_ID}" type="button">OFF</button>`;
  setContent(buttonArea);

  const button = document.getElementById(BUTTON_ID);
  button.addEventListener('click', () => {
    isStart = !isStart;
    button.textContent = isStart ? 'OFF' : 'ON';
    alert(isStart ? 'Start Auto Reload.' : 'Stop Auto Reload.');
    changeStatus(isStart);
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
    8: 300,
    9: 600,
  });
  const selectedListArea = document.createElement('div');
  selectedListArea.setAttribute('id', SELECLTED_ELEMENT_ROOT_ID);
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
      <option value="8"> 5分</option>
      <option value="9"> 10分</option>
  </select>`;
  setContent(selectedListArea);

  const listElement = document.getElementById(SELECTED_LIST_ID);
  listElement.addEventListener('change', (event) => {
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
  const tab = document.getElementsByTagName('a');
  for (let i = 0; i < tab.length; i++) {
    const elem = tab[i];
    const isTab = elem.hasAttribute('role') && elem.getAttribute('role') === 'tab';
    if (!isTab) {
      continue;
    }
    const isSelectedTabElement = elem.hasAttribute('aria-selected') && elem.getAttribute('aria-selected') === 'true';
    if (!isSelectedTabElement) {
      continue;
    }
    elem.click();
  }
}

/**
 * スクロールしているか
 * @return {boolean} true スクロール中 false  一番上にいる
 */
function isScrolling() {
  return document.scrollingElement.scrollTop > 0;
}

/**
 * スクロールイベント登録
 */
function addScrollEvent() {
  const debounced = debounce(() => {
    if (!isStart) {
      return;
    }
    if (isScrolling()) {
      changeStatus(false);
    } else {
      changeStatus(true);
    }
  }, 500);
  window.addEventListener('scroll', debounced);
}

/**
 * debounce
 * @param {*} func 実行する関数
 * @param {number} delay 遅延時間
 * @return {*} debounce処理
 */
function debounce(func, delay) {
  let timerId;

  // eslint-disable-next-line space-before-function-paren
  return function (...args) {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      // eslint-disable-next-line no-invalid-this
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 周期リセット
 * @param {number} intervalSecond
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
// eslint-disable-next-line space-before-function-paren
(function () {
  addRootContainer();
  addStatus();
  addSwithButton();
  addIntervalSetting();
  addStyle();
  addScrollEvent();
  restartInterval(60);
})();
