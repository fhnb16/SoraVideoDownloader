// ==UserScript==
// @name         Sora Video Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет кнопку скачивания поверх каждого видео на sora.chatgpt.com
// @author       fhnb16
// @match        https://sora.chatgpt.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CHECK_INTERVAL = 1000; // Проверять каждую секунду
    const STYLE_ID = 'sora-video-download-style';

    // Добавляем стили один раз
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .sora-download-btn {
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgb(0 0 0 / 42%);
                backdrop-filter: blur(10px);
                color: white;
                border: none;
                border-radius: 9999px;
                padding: 6px 10px;
                font-size: 12px;
                cursor: pointer;
                z-index: 9999;
                transition: background 0.2s;
            }
            .sora-download-btn:hover {
                background: rgba(50, 50, 50, 0.8);
            }
        `;
        document.head.appendChild(style);
    }

    function addDownloadButton(video) {
        // Пропускаем, если кнопка уже добавлена
        if (video.dataset.downloadBtnAdded) return;

        const rect = video.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; // Невидимое видео

        const button = document.createElement('button');
        button.textContent = 'Скачать';
        button.className = 'sora-download-btn';

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const src = video.src || (video.querySelector('source')?.src);
            if (!src) {
                console.warn('Не найден источник видео для скачивания');
                return;
            }

            const a = document.createElement('a');
            a.href = src;
            a.target = "_blank";
            a.download = `sora_video_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        // Оборачиваем video в контейнер с position: relative, если нужно
        let container = video.parentElement;
        const computedStyle = window.getComputedStyle(container);
        if (computedStyle.position === 'static') {
            container.style.position = 'relative';
        }

        video.parentNode.insertBefore(button, video.nextSibling);
        video.dataset.downloadBtnAdded = 'true';
    }

    function observeVideos() {
        document.querySelectorAll('video').forEach(addDownloadButton);
    }

    // Запускаем сразу и затем периодически (на случай динамической загрузки)
    observeVideos();
    setInterval(observeVideos, CHECK_INTERVAL);
})();
