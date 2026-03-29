// ==UserScript==
// @name         Twitter autoload
// @namespace    https://github.com/natsuyasai/TwitterAutoReloadScript
// @version      1.6.2
// @description  Automatically retrieve the latest Tweet(X's).
// @author       natsuyasai
// @match        https://x.com
// @match        https://x.com/
// @match        https://x.com/home
// @match        https://x.com/notifications
// @match        https://x.com/search*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-end
// @supportURL   https://github.com/natsuyasai/TwitterAutoReloadScript
// @license MIT
// ==/UserScript==
(function () {
  'use strict';

  const ROOT_CONTAINER = 'userscript-root-container';
  const BUTTON_ELEMENT_ROOT_ID = 'userscript-button-container';
  const BUTTON_ID = 'userscript-auto-reload-button';
  const SELECLTED_ELEMENT_ROOT_ID = 'userscript-selected-container';
  const SELECTED_LIST_ID = 'userscript-interval-setting';
  const STATUS_ELEMENT_ROOT_ID = 'userscript-status-container';
  const STATUS_ID = 'userscript-auto-reload-status';

  let currentInterval = 60;
  let isEnabled = true;
  let isStoped = false;
  let timerId = -1;
  let followingTabTimerId = -1;
  const FOLLOWING_TAB_MIN_INTERVAL_SEC = 61;

  /**
   * スタイル適用
   */
  function addStyle() {
    const css = `

#${ROOT_CONTAINER} {
  position: fixed;
  display: flex;
  top: 40px;
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
    styleElement.textContent = css;
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
   * @param {boolean} isEnabled ＯＮ状態か
   */
  function changeStatus(isEnabled) {
    const statusElement = document.getElementById(STATUS_ID);
    if (statusElement) {
      if (isEnabled) {
        statusElement.style.color = 'lightgreen';
      } else {
        statusElement.style.color = 'lightgray';
      }
    }
  }


  /**
   * 切り替えボタン追加
   */
  function addSwithButton() {
    const buttonArea = document.createElement('div');
    buttonArea.setAttribute('id', BUTTON_ELEMENT_ROOT_ID);
    buttonArea.innerHTML = `<button id="${BUTTON_ID}" type="button">ON</button>`;
    setContent(buttonArea);

    const button = document.getElementById(BUTTON_ID);
    button.addEventListener('click', () => {
      isStoped = !isStoped;
      button.textContent = isStoped ? 'OFF' : 'ON';
      button.style.backgroundColor = isStoped ? 'gray' : '#03A9F4';
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
      <option value="5"> 1分</option>
      <option value="6"> 2分</option>
      <option value="7"> 3分</option>
      <option value="8" selected> 5分</option>
      <option value="9"> 10分</option>
  </select>`;
    setContent(selectedListArea);

    const listElement = document.getElementById(SELECTED_LIST_ID);
    listElement.addEventListener('focus', () => {
      updateIntervalSettingForTab();
    }, false);
    listElement.addEventListener('change', (event) => {
      const value = parseInt(event.currentTarget.value, 10);
      const intervalSecond = IntervalSecond[value];
      currentInterval = intervalSecond;
      restartInterval(intervalSecond);
    }, false);
  }

  /**
   * メイン処理
   * フォロー中タブは専用タイマーで更新するためここでは対象外とする
   * それ以外のタブはタブクリックで再取得する
   */
  function reselectTab() {
    const tabs = document.querySelectorAll("div[role='tab']");
    for (let i = 0; i < tabs.length; i++) {
      const elem = tabs[i];
      const isSelectedTab =
        elem.hasAttribute("aria-selected") &&
        elem.getAttribute("aria-selected") === "true";
      if (isSelectedTab) {
        if (!isFollowingTab(elem)) {
          elem.click();
        }
        break;
      }
    }
  }

  /**
   * フォロー中タブか判定する
   * フォロー中タブは aria-expanded 属性を持つ
   * @param {HTMLElement} elem タブ要素
   * @return {boolean}
   */
  function isFollowingTab(elem) {
    return elem.hasAttribute('aria-expanded');
  }

  /**
   * 現在フォロー中タブが選択されているか
   * @return {boolean}
   */
  function isFollowingTabActive() {
    const tabs = document.querySelectorAll("div[role='tab']");
    for (let i = 0; i < tabs.length; i++) {
      const elem = tabs[i];
      if (elem.hasAttribute("aria-selected") &&
        elem.getAttribute("aria-selected") === "true" &&
        isFollowingTab(elem)) {
        return true;
      }
    }
    return false;
  }

  /**
   * フォロー中タブの状態に応じて周期選択肢を更新する
   * フォロー中タブ選択中は1分未満の選択肢を無効化し、
   * 現在値が1分未満なら自動的に1分に切り替える
   */
  function updateIntervalSettingForTab() {
    const listElement = document.getElementById(SELECTED_LIST_ID);
    if (!listElement) return;
    const onFollowing = isFollowingTabActive();
    for (const option of listElement.options) {
      // value 0〜4 が 1分未満（5秒・10秒・15秒・30秒・45秒）
      option.disabled = onFollowing && parseInt(option.value, 10) < 5;
    }
    if (onFollowing && parseInt(listElement.value, 10) < 5) {
      listElement.value = '5'; // 1分に切り替え
      currentInterval = 60;
      restartInterval(currentInterval);
    }
  }

  /**
   * 「新しいポストを表示」ボタンを探す
   * タイムラインのセル（cellInnerDiv）のうち article を含まないものにある button を対象とする
   * article を含むセルはツイート本体であり、含まないセルが「新しいポストを表示」ボタンのセルとなる
   * article の有無だけでは通知タブの「もっと見る」ボタン等を誤検出するため cellInnerDiv を基準にする
   * @return {HTMLButtonElement|null}
   */
  function findNewPostsButton() {
    const section = document.querySelector('section[aria-labelledby]');
    if (!section) return null;
    const cells = section.querySelectorAll('[data-testid="cellInnerDiv"]');
    for (const cell of cells) {
      if (cell.querySelector('article')) continue;
      const btn = cell.querySelector('button[type="button"]');
      if (btn) return btn;
    }
    return null;
  }

  /**
   * 「新しいポストを表示」ボタンが出現するのを待ってクリックする
   * MutationObserver でボタンの出現を監視し、見つかり次第クリックする
   * 最大30秒待機してタイムアウトする
   */
  function waitAndClickNewPostsButton() {
    const btn = findNewPostsButton();
    if (btn) {
      btn.click();
      return;
    }
    const section = document.querySelector('section[aria-labelledby]');
    if (!section) return;
    const observer = new MutationObserver(() => {
      const found = findNewPostsButton();
      if (found) {
        observer.disconnect();
        found.click();
      }
    });
    observer.observe(section, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
    }, 30000);
  }

  /**
   * フォロー中タブの更新を誘発する
   * フォーカスイベントを発火してX内部のrevalidateOnFocusを誘発する
   * 新しいポストがあればボタンが出現するので自動クリックする
   */
  function triggerFollowingRefresh() {
    window.dispatchEvent(new Event('focus'));
    waitAndClickNewPostsButton();
  }

  /**
   * フォロー中タブ専用の更新タイマー開始
   * ユーザー設定の周期と最小61秒のうち大きい方を使用する
   * @param {number} intervalSecond ユーザー設定の周期（秒）
   */
  function startFollowingTabInterval(intervalSecond) {
    if (followingTabTimerId > 0) {
      clearInterval(followingTabTimerId);
    }
    const effectiveInterval = Math.max(FOLLOWING_TAB_MIN_INTERVAL_SEC, intervalSecond);
    followingTabTimerId = setInterval(() => {
      if (isStoped || isScrolling() || !isEnabled) {
        return;
      }
      if (isFollowingTabActive()) {
        triggerFollowingRefresh();
      }
    }, 1000 * effectiveInterval);
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
      if (isScrolling()) {
        isEnabled = false;
      } else {
        isEnabled = true;
      }
      changeStatus(isEnabled);
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

    return function (...args) {
      clearTimeout(timerId);

      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * 周期リセット
   * フォロー中タブタイマーも同時に再起動する
   * @param {number} intervalSecond
   */
  function restartInterval(intervalSecond) {
    if (timerId > 0) {
      clearInterval(timerId);
    }
    timerId = setInterval(() => {
      // 停止またはスクロール中なら処理しない
      if (isStoped) {
        return;
      }
      if (isScrolling()) {
        return;
      }
      if (!isEnabled) {
        return;
      }
      reselectTab();
    }, 1000 * intervalSecond);
    startFollowingTabInterval(intervalSecond);
  }

  /**
   * URL変更検知
   * DOM要素の変更を検知してURLが変わったかを確認する
   */
  function watchURLChange() {
    const debounced = debounce(() => {
      chnageURLState();
      updateIntervalSettingForTab();
    }, 500);
    const observer = new MutationObserver(debounced);
    const mainElement = document.getElementsByTagName('main');
    const config = { childList: true, subtree: true };
    if (mainElement.length > 0) {
      observer.observe(mainElement[0], config);
    } else {
      setTimeout(() => {
        watchURLChange();
      }, 1000);
    }
  }

  /**
   * URLに基づいたステータス更新
   */
  function chnageURLState() {
    if (isExecutableURL()) {
      isEnabled = isScrolling() ? false : true;
    } else {
      isEnabled = false;
    }
    changeStatus(isEnabled);
  }

  /**
   * 実行可能なURLか
   * @return {boolean} 実行可能なURLか
   */
  function isExecutableURL() {
    if (location.href === 'https://x.com' ||
      location.href === 'https://x.com/' ||
      location.href.indexOf('https://x.com/home') >= 0 ||
      location.href.indexOf('https://x.com/notifications') >= 0 ||
      location.href.indexOf('https://x.com/search') >= 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 初期設定
   */
  function init() {
    addRootContainer();
    addStatus();
    addSwithButton();
    addIntervalSetting();
    addStyle();
    addScrollEvent();
    restartInterval(currentInterval);
  }

  init();
  chnageURLState();
  watchURLChange();
})();
