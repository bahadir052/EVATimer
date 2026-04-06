// ==UserScript==
// @name         🐾 EVATimer - The Vigilant Watcher
// @namespace    http://tampermonkey.net/
// @version      2.5.1
// @author       BAHO
// @match        *://*.livechatinc.com/*
// @match        *://*.livechat.com/*
// @updateURL    https://raw.githubusercontent.com/bahadir052/EVATimer/main/evatimer.user.js
// @downloadURL  https://raw.githubusercontent.com/bahadir052/EVATimer/main/evatimer.user.js
// @grant        none
// @run-at       document-start
// @allFrames    true
// ==/UserScript==

(function() {
    'use strict';

    if (window.self === window.top) {
        console.log("🚀 EVATimer v2.5.1 (Anomali Dedektörü Aktif) Başarıyla Güncellendi!");
    }

    if (window.self !== window.top) return; 
    if (!window.location.hostname.includes('livechatinc') && !window.location.hostname.includes('livechat')) return;

    // --- 📡 GİZLİ RADAR AYARLARI ---
    const GOOGLE_RADAR_URL = "https://script.google.com/macros/s/AKfycbxPStaJytbSUyfVs52WZ6zMmP8sEprBv6G5OKAr_dCg5N9ZiYUwr--wXty_W6kzwqixCQ/exec";

    // --- 🕵️ ANOMALİ DEDEKTÖRÜ DEĞİŞKENLERİ ---
    let bipHistory = []; // Bip zamanlarını tutan liste
    let spamLock = false; // Sistem sapıtırsa sesi kilitlemek için

    let devicePlaka = localStorage.getItem('eva_device_plaka');
    if (!devicePlaka) {
        devicePlaka = 'PC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('eva_device_plaka', devicePlaka);
    }

    function getAgentEmail() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key && (key.includes('livechat') || key.includes('accounts') || key.includes('auth'))) {
                    let val = localStorage.getItem(key);
                    if (val && val.includes('@')) {
                        let match = val.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                        if (match) return match[0];
                    }
                }
            }
            return "bulunamadi@livechat.com";
        } catch(e) { return "hata@livechat.com"; }
    }

    function sendErrorToRadar(hataTuru, detay) {
        if (!GOOGLE_RADAR_URL || GOOGLE_RADAR_URL.includes("BURAYA")) return;
        let payload = { plaka: devicePlaka, mail: getAgentEmail(), hataTuru: hataTuru, detay: detay };
        try {
            fetch(GOOGLE_RADAR_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });
        } catch (e) {}
    }

    const myTabId = Math.random().toString(36).substring(2, 15);
    let timeMemory = JSON.parse(localStorage.getItem('eva_timer_memory')) || {};
    let globalMute = JSON.parse(localStorage.getItem('eva_global_mute')) || false;
    let audioCtx = null;

    function saveToMemory() {
        localStorage.setItem('eva_timer_memory', JSON.stringify(timeMemory));
    }

    function playBip(frequency = 880) {
        if (globalMute || spamLock) return;

        // --- ANOMALİ DEDEKTÖRÜ (SPAM FİLTRESİ) ---
        const now = Date.now();
        bipHistory.push(now);
        // Son 2 saniye dışındaki kayıtları temizle
        bipHistory = bipHistory.filter(t => now - t < 2000);

        // Eğer 2 saniye içinde 5'ten fazla bip tetiklendiyse (Normalde max 2 olmalı)
        if (bipHistory.length > 5) {
            spamLock = true; // Sesi kilitle
            sendErrorToRadar("Anormal Ses Döngüsü", "2 saniyede 5'ten fazla bip tetiklendi. Sistem koruma amaçlı susturuldu.");
            console.error("⚠️ EVATimer: Anormal ses döngüsü engellendi!");
            return;
        }

        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            sendErrorToRadar("Ses Kartı Hatası", e.message || "Bip çalınamadı");
        }
    }

    function injectStyles() {
        if (document.getElementById('eva-v2-styles')) return;
        const style = document.createElement('style');
        style.id = 'eva-v2-styles';
        style.innerHTML = `
            .eva-v2-slot {
                position: absolute; right: 0px; top: 50%;
                transform: translateY(calc(-50% + 15px));
                width: 130px; height: 32px; background: #000;
                border: 2px solid #333; border-radius: 6px;
                display: flex; align-items: center; justify-content: space-between;
                padding: 0 6px; z-index: 99; color: #fff; overflow: hidden;
            }
            .eva-v2-slot::before {
                content: '🐾'; position: absolute; left: 30px; top: 50%;
                transform: translateY(-50%); font-size: 20px;
                opacity: 0.9; z-index: 1; color: #fff; pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .eva-v2-slot.crit::before { opacity: 0.25; }
            .eva-mute-btn { font-size: 14px; cursor: pointer; user-select: none; position: relative; z-index: 2; transition: transform 0.2s; }
            .eva-mute-btn:hover { transform: scale(1.2); }
            .eva-v2-time { 
                font-size: 13px; font-weight: bold; font-family: monospace; 
                position: relative; z-index: 2; text-shadow: 2px 2px 4px #000; 
                margin-left: 18px; 
            }
            .eva-v2-idle-btn { font-size: 10px; background: #444; color: #fff; padding: 2px 5px; border-radius: 4px; cursor: pointer; border: 1px solid #555; position: relative; z-index: 2; }
            .eva-v2-idle-btn.active { background: #e67e22; color: #000; border-color: #ff9f43; }
            @keyframes eva-pulse { 50% { opacity: 0.5; } }
            li[data-testid*="chat-item-"] { position: relative !important; overflow: visible !important; }
            .eva-v2-slot.warn { border-color: #f1c40f; color: #f1c40f; }
            .eva-v2-slot.crit { border-color: #e74c3c; color: #e74c3c; animation: eva-pulse 0.5s infinite; }
            
            .eva-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.6); z-index: 999999;
                display: flex; align-items: center; justify-content: center;
            }
            .eva-modal-box {
                background: #222; border: 2px solid #444; border-radius: 8px;
                padding: 25px 30px; color: #fff; font-family: sans-serif;
                text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                max-width: 350px;
            }
            .eva-modal-text { margin-bottom: 25px; font-size: 15px; line-height: 1.5; }
            .eva-modal-buttons { display: flex; gap: 10px; justify-content: center; }
            .eva-btn {
                padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer;
                font-weight: bold; font-size: 14px; transition: 0.2s;
            }
            .eva-btn-cancel { background: #555; color: white; }
            .eva-btn-cancel:hover { background: #666; }
            .eva-btn-send { background: #e74c3c; color: white; }
            .eva-btn-send:hover { background: #c0392b; }
        `;
        document.head.appendChild(style);
    }

    function showEvaConfirm(onConfirm) {
        if(document.getElementById('eva-custom-modal')) return;
        const overlay = document.createElement('div');
        overlay.id = 'eva-custom-modal';
        overlay.className = 'eva-modal-overlay';
        overlay.innerHTML = `
            <div class="eva-modal-box">
                <div class="eva-modal-text">⚠️ Bu mesajın aynısını az önce gönderdiniz.<br><br>Yine de göndermek istiyor musunuz?</div>
                <div class="eva-modal-buttons">
                    <button class="eva-btn eva-btn-cancel" id="eva-btn-cancel">İptal</button>
                    <button class="eva-btn eva-btn-send" id="eva-btn-send">Yine de Gönder</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('eva-btn-cancel').onclick = () => overlay.remove();
        document.getElementById('eva-btn-send').onclick = () => { overlay.remove(); if(onConfirm) onConfirm(); };
    }

    const workerCode = `
        let tick = 0;
        setInterval(() => { postMessage(tick++); }, 500);
    `;
    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const timerWorker = new Worker(URL.createObjectURL(workerBlob));

    timerWorker.onmessage = (e) => {
        const tick = e.data;
        const masterData = JSON.parse(localStorage.getItem('eva_master_tab')) || {};
        
        if (masterData.id === myTabId) {
            const now = Date.now();
            Object.keys(timeMemory).forEach(id => {
                const slot = timeMemory[id];
                if (slot.dead) return; 
                if (slot.time <= 0 && slot.time > -10) {
                    if (Math.floor(now / 1000) % 1 === 0 && now % 1000 < 500) playBip(880);
                } else if (slot.time <= -10) {
                    if (Math.floor(now / 1000) % 1 === 0 && now % 1000 < 500) playBip(1200);
                }
            });
        }

        if (tick % 2 === 0) {
            injectStyles();
            let masterData = JSON.parse(localStorage.getItem('eva_master_tab')) || { id: null, time: 0 };
            const now = Date.now();
            let isMaster = false;

            if (masterData.id === myTabId || now - masterData.time > 1500) {
                localStorage.setItem('eva_master_tab', JSON.stringify({ id: myTabId, time: now }));
                isMaster = true;
            }

            timeMemory = JSON.parse(localStorage.getItem('eva_timer_memory')) || {};

            if (isMaster) {
                Object.keys(timeMemory).forEach(id => {
                    if (timeMemory[id] && !timeMemory[id].dead) {
                        if (!timeMemory[id].expireAt) {
                            timeMemory[id].expireAt = now + ((timeMemory[id].time || 120) * 1000);
                        }
                        timeMemory[id].time = Math.ceil((timeMemory[id].expireAt - now) / 1000);
                        
                        if (timeMemory[id].time < -60) {
                            sendErrorToRadar("Kritik Süre Aşımı", "-60 Saniye aşıldığı için sohbet zamanlayıcısı iptal edildi. ID: " + id);
                            delete timeMemory[id];
                        }
                    }
                });
            }

            const myChatsArea = document.querySelector('div[data-testid="my-chats"]');
            const activeIdsOnScreen = [];

            if (myChatsArea) {
                const items = myChatsArea.querySelectorAll('li[data-testid*="chat-item-"]');
                items.forEach(item => {
                    const id = item.getAttribute('data-testid').replace('chat-item-', '');
                    activeIdsOnScreen.push(id);
                    if (!timeMemory[id]) {
                        timeMemory[id] = { expireAt: now + 120000, time: 120, silent: false, dead: false, lastSnippet: "", lastReplied: false, missingTicks: 0, agentLastSent: "" };
                    }
                    const slot = timeMemory[id];
                    slot.missingTicks = 0;
                    const repliedIcon = item.querySelector('[data-testid="replied"]');
                    const messageSnippet = item.querySelector('[data-testid="last-message-text"]')?.textContent || "";
                    const isReplied = !!repliedIcon;
                    if (isReplied && slot.lastReplied === false) {
                        slot.expireAt = now + 120000;
                        slot.time = 120;
                        slot.silent = false;
                        slot.agentLastSent = messageSnippet.trim();
                    }
                    slot.lastReplied = isReplied;
                    slot.lastSnippet = messageSnippet;

                    const closeBtn = item.querySelector('[data-testid="list-close-chat-button"]');
                    const isAlive = !!(closeBtn && closeBtn.nextElementSibling && closeBtn.nextElementSibling.textContent.trim() !== '');
                    
                    if (isAlive) {
                        let slotEl = item.querySelector('.eva-v2-slot');
                        if (!slotEl) {
                            slotEl = document.createElement('div');
                            slotEl.className = 'eva-v2-slot';
                            item.appendChild(slotEl);
                        }
                        let displayTime = slot.time >= 0 ? slot.time + 's' : '!!! ' + slot.time + 's';
                        if (slot.time <= -20) displayTime = ':(';
                        globalMute = JSON.parse(localStorage.getItem('eva_global_mute')) || false;
                        slotEl.innerHTML = `
                            <div class="eva-mute-btn">${globalMute ? '🔇' : '🔊'}</div>
                            <div class="eva-v2-time">${displayTime}</div>
                            <div class="eva-v2-idle-btn ${slot.silent ? 'active' : ''}" data-eva-id="${id}">Idle</div>
                        `;
                        let bc = 'eva-v2-slot';
                        if (slot.silent) bc += ' is-silent';
                        if (slot.time <= 20 && slot.time > 0) bc += ' warn';
                        else if (slot.time <= 0) bc += ' crit';
                        slotEl.className = bc;
                    } else {
                        const oldSlot = item.querySelector('.eva-v2-slot');
                        if (oldSlot) oldSlot.remove();
                        slot.dead = true;
                    }
                });
            }

            document.querySelectorAll('.eva-v2-slot').forEach(s => { if (!s.closest('[data-testid="my-chats"]')) s.remove(); });
            const chatsListColumn = document.getElementById('chats-list-column');
            if (chatsListColumn) {
                Object.keys(timeMemory).forEach(id => {
                    if (!activeIdsOnScreen.includes(id)) {
                        timeMemory[id].missingTicks = (timeMemory[id].missingTicks || 0) + 1;
                        if (timeMemory[id].missingTicks >= 3) delete timeMemory[id];
                    }
                });
            }
            saveToMemory();
        }
    };

    function triggerOptimistic(id, sentText) {
        const now = Date.now();
        timeMemory = JSON.parse(localStorage.getItem('eva_timer_memory')) || {};
        if (!timeMemory[id]) {
            timeMemory[id] = { expireAt: now + 120000, time: 120, silent: false, dead: false, lastSnippet: "", lastReplied: false, missingTicks: 0, agentLastSent: "" };
        }
        let slot = timeMemory[id];
        slot.previousExpireAt = slot.expireAt || (now + 120000); 
        slot.expireAt = now + 120000; 
        slot.time = 120;
        slot.silent = false;
        if (sentText !== "") slot.agentLastSent = sentText;
        saveToMemory();
    }

    function handleSendAttempt(e) {
        const sendBtn = document.querySelector('[data-testid="send-button"]');
        if (sendBtn && sendBtn.disabled) return; 
        const privateModeBtn = document.querySelector('[data-testid="private-mode-menu"]');
        if (privateModeBtn && !privateModeBtn.textContent.toLowerCase().includes('message')) return;
        const inputArea = document.querySelector('[data-testid="chat-feed-text-area-test-id"]');
        const originalText = inputArea ? inputArea.textContent.trim() : "";
        const currentId = window.location.pathname.split('/').pop();
        timeMemory = JSON.parse(localStorage.getItem('eva_timer_memory')) || {};
        if (originalText !== "" && timeMemory[currentId] && timeMemory[currentId].agentLastSent === originalText) {
            e.preventDefault(); e.stopImmediatePropagation();
            showEvaConfirm(() => {
                timeMemory = JSON.parse(localStorage.getItem('eva_timer_memory')) || {};
                if(timeMemory[currentId]) { timeMemory[currentId].agentLastSent = null; saveToMemory(); }
                const physicalSendBtn = document.querySelector('[data-testid="send-button"]');
                if (physicalSendBtn && !physicalSendBtn.disabled) physicalSendBtn.click();
            });
            return false;
        }
        if (originalText !== "") {
            let checks = 0;
            const watcher = setInterval(() => {
                checks++;
                const currentBox = document.querySelector('[data-testid="chat-feed-text-area-test-id"]');
                const newText = currentBox ? currentBox.textContent.trim() : "";
                if (newText === "") { clearInterval(watcher); triggerOptimistic(currentId, originalText); }
                else if (newText !== originalText && newText.length > originalText.length) clearInterval(watcher);
                else if (checks >= 15) clearInterval(watcher);
            }, 20);
        } else triggerOptimistic(currentId, "");
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target.closest('[data-testid="chat-feed-text-area-test-id"]')) handleSendAttempt(e);
    }, true);

    document.addEventListener('click', (e) => {
        const muteBtn = e.target.closest('.eva-mute-btn');
        if (muteBtn) {
            e.preventDefault(); e.stopPropagation();
            globalMute = !globalMute;
            localStorage.setItem('eva_global_mute', globalMute);
            // Spam kilidi varsa, kullanıcı mute'a basınca kilidi de aç (Reset)
            spamLock = false; 
            bipHistory = [];
            return;
        }
        const idleBtn = e.target.closest('.eva-v2-idle-btn');
        if (idleBtn) {
            e.preventDefault(); e.stopPropagation();
            const id = idleBtn.getAttribute('data-eva-id');
            timeMemory = JSON.parse(localStorage.getItem('eva_timer_memory')) || {};
            if (timeMemory[id]) {
                const now = Date.now();
                if (timeMemory[id].silent) {
                    if (confirm("Idle modundan çıkmak istediğine emin misin?")) {
                        timeMemory[id].silent = false; timeMemory[id].expireAt = now + 120000; timeMemory[id].time = 120;
                    }
                } else { timeMemory[id].silent = true; timeMemory[id].expireAt = now + 60000; timeMemory[id].time = 60; }
                saveToMemory();
            }
            return;
        }
        if (e.target.closest('[data-testid="send-button"]')) handleSendAttempt(e);
    }, true);

})();
