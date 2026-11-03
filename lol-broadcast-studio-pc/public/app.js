/**
 * LOL REAL TOURNAMENT PIPELINE & SPECTATOR ENGINE — ZERO-FLICKER DOM CLIENT
 * Static controls are mounted once so typing & clicking are never interrupted by WebSocket syncs.
 */

(function () {
  let state = null;
  let ws = null;
  let shellMounted = false;

  function connectWs() {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${proto}//${window.location.host}`);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'PIPELINE_SYNC') {
          state = msg.state;
          if (!shellMounted) {
            mountShell(state);
            shellMounted = true;
          }
          updateDynamicZones(state);
        }
      } catch (_) {}
    };
    ws.onclose = () => setTimeout(connectWs, 1000);
  }

  window.dispatchAction = function (type, payload = {}) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    } else {
      fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
    }
  };

  window.createLobbyFromInputs = function () {
    const nameEl = document.getElementById('inp-lobby-name');
    const passEl = document.getElementById('inp-lobby-pass');
    const queueEl = document.getElementById('inp-queue-id');
    dispatchAction('CREATE_TOURNAMENT_LOBBY', {
      lobbyName: nameEl ? nameEl.value : 'GIAI DAU LOL - BO3 VAN 1',
      lobbyPassword: passEl ? passEl.value : '123',
      queueId: queueEl ? Number(queueEl.value) : 3130
    });
  };

  window.oneClickSpectatorSetup = function () {
    const nameEl = document.getElementById('inp-lobby-name');
    const passEl = document.getElementById('inp-lobby-pass');
    const queueEl = document.getElementById('inp-queue-id');
    dispatchAction('ONE_CLICK_SETUP_SPECTATOR_MATCH', {
      lobbyName: nameEl ? nameEl.value : 'GIAI DAU LOL - BO3 VAN 1',
      lobbyPassword: passEl ? passEl.value : '123',
      queueId: queueEl ? Number(queueEl.value) : 3100
    });
  };

  function mountShell(initialState) {
    const root = document.getElementById('app');
    root.innerHTML = `
      <!-- TOP HEADER -->
      <header class="top-nav liquid-glass">
        <div class="brand-cluster">
          <span class="brand-badge">LUỒNG THẬT 100% (PATCH 16.21 VERIFIED)</span>
          <div>
            <div class="brand-title">Bộ Điều Khiển Tạo Phòng Giải Đấu & Xem Trực Tiếp Liên Minh Huyền Thoại</div>
            <div class="brand-sub" id="zone-header-sub"></div>
          </div>
        </div>
        <div class="status-cluster" id="zone-header-badges"></div>
      </header>

      <!-- 4-STEP REAL PIPELINE GRID -->
      <div style="flex:1; display:grid; grid-template-columns: 1fr 1fr; gap:12px; min-height:0; overflow-y:auto;">

        <!-- LEFT COLUMN: STEP 1 & STEP 2 -->
        <div class="director-pane liquid-glass" style="gap:12px;">

          <!-- BƯỚC 1 -->
          <div class="section-card">
            <div class="section-header">
              <span class="section-title">BƯỚC 1: VÀO GAME & BẮT CHÌA KHÓA SẢNH CHỜ (LCU LOCKFILE)</span>
              <span class="section-tag" id="zone-step1-tag"></span>
            </div>
            <div id="zone-step1-info" style="font-size:12px; color:#cbd5e1; line-height:1.55;"></div>
            <div class="btn-row-2">
              <button class="liquid-btn active" onclick="dispatchAction('LAUNCH_LOL_CLIENT')">
                <span>Mở Sảnh Liên Minh Huyền Thoại</span>
                <small>Khởi chạy LeagueClient.exe trên máy</small>
              </button>
              <button class="liquid-btn" onclick="dispatchAction('PATCH_GAME_CFG')">
                <span>Ghi Lại EnableReplayApi=1</span>
                <small>Mở khóa API Trọng tài trong game.cfg</small>
              </button>
            </div>
          </div>

          <!-- BƯỚC 2 -->
          <div class="section-card">
            <div class="section-header">
              <span class="section-title">BƯỚC 2: TẠO PHÒNG GIẢI ĐẤU (CUSTOM LOBBY) & NGỒI Ô TRỌNG TÀI</span>
              <span class="section-tag">POST /lol-lobby/v2/lobby</span>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 110px 210px; gap:8px;">
              <div>
                <div style="font-size:10px; color:#94a3b8; margin-bottom:3px;">Tên Phòng Giải Đấu:</div>
                <input id="inp-lobby-name" value="${initialState.lobby.lobbyName}"
                       style="width:100%; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.28); background:rgba(0,0,0,0.45); color:#fff; font-weight:700; user-select:text;" />
              </div>
              <div>
                <div style="font-size:10px; color:#94a3b8; margin-bottom:3px;">Mật khẩu:</div>
                <input id="inp-lobby-pass" value="${initialState.lobby.lobbyPassword}"
                       style="width:100%; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.28); background:rgba(0,0,0,0.45); color:#fff; font-weight:700; user-select:text;" />
              </div>
              <div>
                <div style="font-size:10px; color:#94a3b8; margin-bottom:3px;">Chế độ Phòng Giải (QueueID):</div>
                <select id="inp-queue-id"
                        style="width:100%; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.28); background:rgba(15,23,42,0.95); color:#fff; font-weight:700;">
                  <option value="3130" selected>Tournament Draft (Đấu Giải 5v5 - ID 3130)</option>
                  <option value="3100">Blind Pick (Chọn Ẩn 5v5 - ID 3100)</option>
                  <option value="3110">Draft Pick (Cấm Chọn Thường - ID 3110)</option>
                  <option value="3140">Practice Tool (Phòng Tập - ID 3140)</option>
                </select>
              </div>
            </div>

            <div class="btn-row-2" style="margin-top:4px;">
              <button class="liquid-btn active" onclick="createLobbyFromInputs()">
                <span>1. Tạo Phòng Giải Đấu 5v5 Ngay</span>
                <small>Mở phòng chuẩn trong Sảnh LoL thật</small>
              </button>
              <button class="liquid-btn active" style="border-color:#fde047;" onclick="oneClickSpectatorSetup()">
                <span style="color:#fde047;">TẠO NHANH 1-CHẠM (PHÒNG + BOT + TRỌNG TÀI)</span>
                <small>Tạo phòng + Thêm Bot 2 bên + Xuống ghế Trọng tài</small>
              </button>
            </div>

            <div class="btn-row-3">
              <button class="liquid-btn" onclick="dispatchAction('SWITCH_TO_SPECTATOR')">
                <span>2. Nhảy Xuống Ô Trọng Tài</span>
                <small>POST /lobby/team/SPECTATOR</small>
              </button>
              <button class="liquid-btn" onclick="dispatchAction('ADD_TEST_BOTS', { teamId: '100' })">
                <span>+1 Bot Đội Xanh (100)</span>
                <small>Thêm Bot RSINTERMEDIATE</small>
              </button>
              <button class="liquid-btn" onclick="dispatchAction('ADD_TEST_BOTS', { teamId: '200' })">
                <span>+1 Bot Đội Đỏ (200)</span>
                <small>Thêm Bot RSINTERMEDIATE</small>
              </button>
            </div>

            <div class="btn-row-3">
              <button class="liquid-btn" onclick="dispatchAction('SWITCH_TO_PLAYER', { team: 'TEAM1' })">
                <span>Lên Đội Xanh (TEAM1)</span>
                <small>Ngồi ghế tuyển thủ Đội 1</small>
              </button>
              <button class="liquid-btn" onclick="dispatchAction('SWITCH_TO_PLAYER', { team: 'TEAM2' })">
                <span>Lên Đội Đỏ (TEAM2)</span>
                <small>Ngồi ghế tuyển thủ Đội 2</small>
              </button>
              <button class="liquid-btn red-active" onclick="dispatchAction('START_CHAMP_SELECT')">
                <span>3. BẮT ĐẦU TRẬN ĐẤU (START)</span>
                <small>Vào Cấm/Chọn & Xem Trực Tiếp</small>
              </button>
            </div>

            <!-- Danh sách thành viên trong phòng đọc realtime -->
            <div id="zone-lobby-members" style="margin-top:6px; padding:10px; border-radius:12px; background:rgba(0,0,0,0.35); font-size:11px;"></div>
          </div>

        </div>

        <!-- RIGHT COLUMN: STEP 3 & STEP 4 & LOGS -->
        <div class="director-pane liquid-glass" style="gap:12px;">

          <!-- BƯỚC 3 -->
          <div class="section-card">
            <div class="section-header">
              <span class="section-title">BƯỚC 3: LUỒNG DỮ LIỆU CẤM/CHỌN THẬT (GET /lol-champ-select/v1/session)</span>
              <span class="section-tag" id="zone-step3-tag"></span>
            </div>
            <div id="zone-step3-body"></div>
          </div>

          <!-- BƯỚC 4 -->
          <div class="section-card">
            <div class="section-header">
              <span class="section-title">BƯỚC 4: XEM TRỰC TIẾP & ĐIỀU KHIỂN CỬA SỔ GAME THẬT (CỔNG 127.0.0.1:2999)</span>
              <span class="section-tag" id="zone-step4-tag"></span>
            </div>

            <div class="btn-row-3">
              <button class="liquid-btn" onclick="dispatchAction('PORT2999_HIDE_DEFAULT_HUD')">
                <span id="zone-btn-hud-label">Ẩn/Hiện HUD Mặc Định Game</span>
                <small>POST /replay/render</small>
              </button>
              <button class="liquid-btn" onclick="dispatchAction('PORT2999_SET_FOG', { mode: 'Toggle' })">
                <span id="zone-btn-fog-label">Bật/Tắt Sương Mù (Fog)</span>
                <small>POST /replay/render</small>
              </button>
              <button class="liquid-btn" onclick="dispatchAction('PORT2999_REWIND_15S')">
                <span>Tua Lùi 15 Giây</span>
                <small>POST /replay/playback</small>
              </button>
            </div>

            <div style="font-size:11px; color:#bae6fd; font-weight:700; margin-top:4px;">
              Bắn phím tắt chuyển Camera Trọng Tài thẳng vào cửa sổ Game (1..5 Đội Xanh | Q..T Đội Đỏ | D Tự động):
            </div>
            <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:6px;">
              ${['1', '2', '3', '4', '5', 'D', 'q', 'w', 'e', 'r', 't', 'p']
                .map(
                  (k) => `
                <button class="liquid-btn" style="padding:6px;"
                        onclick="dispatchAction('SEND_SPECTATOR_CAMERA_KEY', { key: '${k}' })">
                  <span>Phím [${k.toUpperCase()}]</span>
                </button>
              `
                )
                .join('')}
            </div>

            <div id="zone-step4-players" style="margin-top:6px; padding:10px; border-radius:12px; background:rgba(0,0,0,0.35); font-size:11px; max-height:170px; overflow-y:auto;"></div>
          </div>

          <!-- LOGS -->
          <div class="section-card" style="flex:1; min-height:130px;">
            <div class="section-header">
              <span class="section-title">NHẬT KÝ KẾT NỐI & LỆNH API GỬI VÀO GAME (REALTIME LOGS)</span>
              <span class="section-tag">127.0.0.1</span>
            </div>
            <div id="zone-logs" style="flex:1; overflow-y:auto; font-family:Consolas, monospace; font-size:11px; color:#a7f3d0; background:rgba(0,0,0,0.45); padding:8px 10px; border-radius:10px; line-height:1.5;"></div>
          </div>

        </div>
      </div>
    `;
  }

  function updateDynamicZones(st) {
    const { lcu, lobby, champSelect, liveSpectator2999 } = st;

    const headerSub = document.getElementById('zone-header-sub');
    if (headerSub) {
      headerSub.innerHTML = `Bộ cài đã nhận diện: <strong>${st.installDir}</strong> | Replay API (game.cfg): <strong style="color:#6ee7b7;">${st.replayApiEnabledInCfg ? 'ĐÃ BẬT (EnableReplayApi=1)' : 'CHƯA BẬT'}</strong>`;
    }

    const headerBadges = document.getElementById('zone-header-badges');
    if (headerBadges) {
      headerBadges.innerHTML = `
        <span class="status-chip" style="background:${lcu.connected ? 'rgba(16,185,129,0.22)' : 'rgba(244,63,94,0.22)'}; border-color:${lcu.connected ? '#34d399' : '#fb7185'}; color:${lcu.connected ? '#6ee7b7' : '#fda4af'};">
          SẢNH LCU: ${lcu.connected ? `ĐÃ KẾT NỐI (Port ${lcu.port} | Phase: ${lcu.gameflowPhase})` : 'CHƯA MỞ GAME LOL'}
        </span>
        <span class="status-chip" style="background:${liveSpectator2999.connected ? 'rgba(14,165,233,0.25)' : 'rgba(255,255,255,0.08)'}; border-color:${liveSpectator2999.connected ? '#38bdf8' : 'rgba(255,255,255,0.2)'}; color:${liveSpectator2999.connected ? '#7dd3fc' : '#94a3b8'};">
          TRONG TRẬN (PORT 2999): ${liveSpectator2999.connected ? `ĐANG XEM TRỰC TIẾP (${liveSpectator2999.gameTime}s)` : 'CHƯA VÀO TRẬN 3D'}
        </span>
      `;
    }

    const step1Tag = document.getElementById('zone-step1-tag');
    if (step1Tag) {
      step1Tag.textContent = lcu.connected ? 'ĐÃ THÔNG LUỒNG BƯỚC 1' : 'ĐANG CHỜ BẬT LOL';
    }

    const step1Info = document.getElementById('zone-step1-info');
    if (step1Info) {
      step1Info.innerHTML = `
        <div>- Đường dẫn game trên máy: <strong>${st.installDir}</strong></div>
        <div>- Cấu hình Trọng tài (<code>Config\\game.cfg</code>): <strong style="color:#6ee7b7;">EnableReplayApi=1 (${st.replayApiEnabledInCfg ? 'Đã kích hoạt tự động' : 'Chưa bật'})</strong></div>
        <div>- Tài khoản đang đăng nhập Sảnh LoL: <strong style="color:#fde047;">${lcu.summoner ? `${lcu.summoner.gameName}#${lcu.summoner.tagLine} (Lv.${lcu.summoner.summonerLevel})` : 'Chưa phát hiện'}</strong></div>
        <div>- Trạng thái Sảnh hiện tại (<code>gameflow-phase</code>): <strong style="color:#38bdf8;">${lcu.gameflowPhase}</strong></div>
      `;
    }

    const lobbyBox = document.getElementById('zone-lobby-members');
    if (lobbyBox) {
      lobbyBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-weight:800; color:#bae6fd; margin-bottom:6px;">
          <span>DANH SÁCH TRONG PHÒNG CHỜ THẬT ĐANG ĐỌC TỪ GAME (${lobby.active ? `ĐANG Ở TRONG PHÒNG "${lobby.lobbyName}"` : 'CHƯA Ở TRONG PHÒNG'}):</span>
          <span style="color:${lobby.canStartActivity ? '#6ee7b7' : '#fda4af'};">${lobby.canStartActivity ? 'SẴN SÀNG BẮT ĐẦU (canStart=true)' : 'CHƯA ĐỦ ĐIỀU KIỆN BẮT ĐẦU'}</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
          <div>
            <strong style="color:#38bdf8;">Đội Xanh (${lobby.teamOne.length}/5):</strong>
            ${lobby.teamOne.map((m) => `<div>- ${m.label}</div>`).join('') || '<div style="color:#64748b;">(Trống)</div>'}
          </div>
          <div>
            <strong style="color:#fb7185;">Đội Đỏ (${lobby.teamTwo.length}/5):</strong>
            ${lobby.teamTwo.map((m) => `<div>- ${m.label}</div>`).join('') || '<div style="color:#64748b;">(Trống)</div>'}
          </div>
          <div>
            <strong style="color:#fde047;">Trọng Tài / Xem (${lobby.spectators.length}):</strong>
            ${lobby.spectators.map((m) => `<div>- ${m.label}</div>`).join('') || '<div style="color:#64748b;">(Trống)</div>'}
          </div>
        </div>
      `;
    }

    const step3Tag = document.getElementById('zone-step3-tag');
    if (step3Tag) {
      step3Tag.textContent = champSelect.active ? `ĐANG CẤM/CHỌN (${champSelect.timeLeftSec}s)` : 'CHƯA VÀO CẤM/CHỌN';
    }

    const step3Body = document.getElementById('zone-step3-body');
    if (step3Body) {
      step3Body.innerHTML = champSelect.active
        ? `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12px;">
             <div style="padding:8px; border-radius:10px; background:rgba(14,165,233,0.15);">
               <strong style="color:#38bdf8;">Đội Xanh (myTeam):</strong>
               ${champSelect.myTeam.map((c, idx) => `<div>Slot ${idx + 1}: ChampID = <strong>${c.championId}</strong> (${c.assignedPosition || 'Flex'})</div>`).join('')}
             </div>
             <div style="padding:8px; border-radius:10px; background:rgba(244,63,94,0.15);">
               <strong style="color:#fb7185;">Đội Đỏ (theirTeam):</strong>
               ${champSelect.theirTeam.map((c, idx) => `<div>Slot ${idx + 1}: ChampID = <strong>${c.championId}</strong> (${c.assignedPosition || 'Flex'})</div>`).join('')}
             </div>
           </div>`
        : `<div style="font-size:12px; color:#94a3b8;">
             Khi bạn bấm <strong>"3. BẮT ĐẦU TRẬN ĐẤU"</strong> ở Bước 2, sảnh LoL chuyển sang màn hình Cấm/Chọn và toàn bộ dữ liệu Tướng đang nhá, Tướng đã khóa, Lượt cấm và Đồng hồ đếm ngược sẽ tự động chảy vào đây với độ trễ 0.01 giây.
           </div>`;
    }

    const step4Tag = document.getElementById('zone-step4-tag');
    if (step4Tag) {
      step4Tag.textContent = liveSpectator2999.connected ? `LIVE ${liveSpectator2999.gameTime}s` : 'ĐỢI VÀO BẢN ĐỒ 3D';
    }

    const step4Players = document.getElementById('zone-step4-players');
    if (step4Players) {
      step4Players.innerHTML = `
        <div style="font-weight:800; color:#fde047; margin-bottom:4px;">
          DỮ LIỆU TRỰC TIẾP ĐỌC TỪ https://127.0.0.1:2999/liveclientdata/allgamedata:
        </div>
        ${
          liveSpectator2999.connected
            ? liveSpectator2999.allPlayers
                .map(
                  (p) => `
                <div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid rgba(255,255,255,0.07);">
                  <span style="color:${p.team === 'ORDER' ? '#38bdf8' : '#fb7185'}; font-weight:700;">[${p.team === 'ORDER' ? 'XANH' : 'ĐỎ'}] ${p.summonerName} (${p.championName})</span>
                  <span>Lv.${p.level} | KDA: ${p.kills}/${p.deaths}/${p.assists} | CS: ${p.creepScore} | Đồ: [${p.items.join(', ')}]</span>
                </div>
              `
                )
                .join('')
            : '<div style="color:#94a3b8;">Chưa có trận đấu 3D nào đang chạy. Hãy bấm "3. BẮT ĐẦU TRẬN ĐẤU" ở Bước 2 để vào trận và xem dữ liệu thật đổ về đây!</div>'
        }
      `;
    }

    const logsEl = document.getElementById('zone-logs');
    if (logsEl) {
      logsEl.innerHTML = st.logs.map((l) => `<div>${l}</div>`).join('');
    }
  }

  connectWs();
})();
