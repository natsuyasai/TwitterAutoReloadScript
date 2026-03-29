// ==UserScript==
// @name         Twitter autoload
// @namespace    https://github.com/natsuyasai/TwitterAutoReloadScript
// @version      1.8.0
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
  const SELECTED_ELEMENT_ROOT_ID = 'userscript-selected-container';
  const SELECTED_LIST_ID = 'userscript-interval-setting';
  const STATUS_ELEMENT_ROOT_ID = 'userscript-status-container';
  const STATUS_ID = 'userscript-auto-reload-status';

  let currentInterval = 60;
  let isEnabled = true;
  let isStopped = false;
  let timerId = -1;
  let fadeTimerId = -1;
  const FADE_DELAY = 3000;

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
  opacity: 1;
  transition: opacity 0.5s ease;
  z-index: 9999;
}

#${ROOT_CONTAINER}.faded {
  opacity: 0.05;
}

#${ROOT_CONTAINER}:hover {
  opacity: 1 !important;
}

#${BUTTON_ELEMENT_ROOT_ID},
#${SELECTED_ELEMENT_ROOT_ID},
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

/* タイムラインのツイート文字サイズを小さく */
[data-testid="tweetText"] {
  font-size: 12px !important;
}

/* ツイートのアクションバーを折りたたむ（ホバーで展開） */
[role="group"][id] {
  height: 4px !important;
  overflow: hidden !important;
  opacity: 0.3;
  transition: height 0.2s ease, opacity 0.2s ease;
}
[role="group"][id]:hover {
  height: auto !important;
  overflow: visible !important;
  opacity: 1;
}

`;
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    document.head.append(styleElement);
  }

  /**
   * フェードタイマーをリセットして再開
   */
  function resetFadeTimer() {
    const root = document.getElementById(ROOT_CONTAINER);
    if (root) {
      root.classList.remove('faded');
    }
    if (fadeTimerId !== -1) {
      clearTimeout(fadeTimerId);
    }
    fadeTimerId = setTimeout(() => {
      if (root) {
        root.classList.add('faded');
      }
    }, FADE_DELAY);
  }

  /**
   * ルート要素追加
   */
  function addRootContainer() {
    const rootArea = document.createElement('div');
    rootArea.setAttribute('id', ROOT_CONTAINER);
    rootArea.addEventListener('mouseenter', () => {
      rootArea.classList.remove('faded');
      if (fadeTimerId !== -1) {
        clearTimeout(fadeTimerId);
      }
    });
    rootArea.addEventListener('mouseleave', () => {
      resetFadeTimer();
    });
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
        const selecter = document.getElementById(SELECTED_ELEMENT_ROOT_ID);

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
  function addSwitchButton() {
    const buttonArea = document.createElement('div');
    buttonArea.setAttribute('id', BUTTON_ELEMENT_ROOT_ID);
    buttonArea.innerHTML = `<button id="${BUTTON_ID}" type="button">ON</button>`;
    setContent(buttonArea);

    const button = document.getElementById(BUTTON_ID);
    button.addEventListener('click', () => {
      isStopped = !isStopped;
      button.textContent = isStopped ? 'OFF' : 'ON';
      button.style.backgroundColor = isStopped ? 'gray' : '#03A9F4';
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
    selectedListArea.setAttribute('id', SELECTED_ELEMENT_ROOT_ID);
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
    listElement.addEventListener('change', (event) => {
      const value = parseInt(event.currentTarget.value, 10);
      const intervalSecond = IntervalSecond[value];
      restartInterval(intervalSecond);
      currentInterval = intervalSecond;
    }, false);
  }

  /**
   * メイン処理
   * 「新しいポストを表示」バナーがあればクリック、
   * なければホームナビリンクをクリックしてタイムラインを更新
   */
  function reloadTimeline() {
    // 「N件のポストを表示」バナーを探す (新しいツイートがある場合に表示される)
    // data-testid を優先し、フォールバックでインラインスタイルのセレクタを使用
    const newTweetsCells = document.querySelectorAll("div[role='main'] div[role='button']");
    for (const cell of newTweetsCells) {
      // 新着バナーはtimelineの上部にあり、translate styleを持つ要素内に配置される
      const hasTranslate = cell.closest("div[style*='translate']");
      if (hasTranslate && cell.querySelector('span')) {
        cell.click();
        return;
      }
    }

    // ホームのナビリンクをクリックしてタイムラインを更新
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath === '/home') {
      const homeLink = document.querySelector("a[href='/home'][role='link']");
      if (homeLink) {
        homeLink.click();
        return;
      }
    }

    // 通知・検索ページの場合は従来のタブクリック方式にフォールバック
    const tabs = document.querySelectorAll("div[role='tab']");
    for (let i = 0; i < tabs.length; i++) {
      const elem = tabs[i];
      const isSelectedTab =
        elem.hasAttribute("aria-selected") &&
        elem.getAttribute("aria-selected") === "true";
      if (isSelectedTab) {
        elem.click();
        break;
      }
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
   * @param {number} intervalSecond
   */
  function restartInterval(intervalSecond) {
    if (timerId !== -1) {
      clearInterval(timerId);
    }
    timerId = setInterval(() => {
      // 停止またはスクロール中なら処理しない
      if (isStopped) {
        return;
      }
      if (isScrolling()) {
        return;
      }
      if (!isEnabled) {
        return;
      }
      reloadTimeline();
    }, 1000 * intervalSecond);
  }

  /**
   * URL変更検知
   * DOM要素の変更を検知してURLが変わったかを確認する
   */
  function watchURLChange() {
    const debounced = debounce(() => {
      changeURLState();
      hideNarrowViewportElements();
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
  function changeURLState() {
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
   * 狭いビューポート時に不要なUI要素を非表示にする
   * CSSではなくJSで個別要素を直接操作し、レイアウト崩れを防ぐ
   */
  function hideNarrowViewportElements() {
    const isNarrow = window.innerWidth <= 1280;
    const val = isNarrow ? 'none' : '';

    // 左サイドバー: headerは残し、中身の各子要素を非表示にする
    const banner = document.querySelector('header[role="banner"]');
    if (banner) {
      banner.style.visibility = isNarrow ? 'hidden' : '';
      banner.style.width = isNarrow ? '0' : '';
      banner.style.minWidth = isNarrow ? '0' : '';
      banner.style.overflow = isNarrow ? 'hidden' : '';
    }

    // primaryColumn内のタブバー・投稿エリアをまとめて処理
    const primaryColumn = document.querySelector("[data-testid='primaryColumn']");
    if (primaryColumn) {
      // primaryColumnの直下の子要素を走査
      const children = primaryColumn.children;
      for (const child of children) {
        // タイムライン本体（cellInnerDiv を含む）はスキップ
        if (child.querySelector("[data-testid='cellInnerDiv']")) continue;
        // タブバーまたは投稿エリアを含む要素を非表示
        const hasTablist = child.querySelector("[role='tablist']");
        const hasTweetBox = child.querySelector("[data-testid='tweetTextarea_0']");
        if (hasTablist || hasTweetBox) {
          child.style.display = val;
        }
      }
    }

    // フローティングPostボタン
    const postBtn = document.querySelector("a[data-testid='SideNav_NewTweet_Button']");
    if (postBtn) {
      postBtn.style.display = val;
    }
  }

  /**
   * 初期設定
   */
  function init() {
    addRootContainer();
    addStatus();
    addSwitchButton();
    addIntervalSetting();
    addStyle();
    addScrollEvent();
    restartInterval(currentInterval);
    resetFadeTimer();

    // 狭いビューポート対応: リサイズとDOM変更を監視
    hideNarrowViewportElements();
    window.addEventListener('resize', debounce(hideNarrowViewportElements, 300));
  }

  init();
  changeURLState();
  watchURLChange();
})();
