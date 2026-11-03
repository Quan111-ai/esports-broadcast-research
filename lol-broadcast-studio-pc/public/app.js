/**
 * LOL BROADCAST STUDIO PC — APPLE LIQUID GLASS CLIENT & OVERLAY ENGINE
 * Connects via WebSocket (0.2ms latency) to the local Node.js Riot LCU / Port 2999 Engine.
 */

(function () {
  const params = new URLSearchParams(window.location.search);
  let currentView = params.get('view') || 'studio'; // 'studio' | 'director' | 'overlay169' | 'overlay916'
  let appState = null;
  let lanInfo = { lanIp: '127.0.0.1', port: 3080 };
  let ws = null;

  function connectWebSocket() {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${proto}//${window.location.host}`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'STATE_SYNC') {
          appState = msg.state;
          lanInfo = { lanIp: msg.lanIp || '127.0.0.1', port: msg.port || 3080 };
          renderApp();
        }
      } catch (_) {}
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 1000);
    };
  }

  window.sendDirectorAction = function (type, payload = {}) {
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

  window.setViewMode = function (mode) {
    currentView = mode;
    renderApp();
  };

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function formatGold(g) {
    return (g / 1000).toFixed(1) + 'K';
  }

  function getSelectedPair(state) {
    const role = state.director.selectedRole || 'MID';
    const bluePlayer = state.blueTeam.players.find((p) => p.role === role) || state.blueTeam.players[2];
    const redPlayer = state.redTeam.players.find((p) => p.role === role) || state.redTeam.players[2];
    const activePlayer =
      [...state.blueTeam.players, ...state.redTeam.players].find((p) => p.id === state.director.selectedPositionId) ||
      bluePlayer;
    return { role, bluePlayer, redPlayer, activePlayer };
  }

  // ==========================================================================
  // RENDER 1: DIRECTOR TOUCH CONTROL DECK (4 CORE BIG-TOURNAMENT GROUPS)
  // ==========================================================================
  function renderDirectorPane(state) {
    const { director, meta, inGame, blueTeam, redTeam } = state;

    const renderTeamPosButtons = (team, side) =>
      team.players
        .map((p) => {
          const isSelected = director.selectedPositionId === p.id;
          const isHotspot = inGame.aiCombatAlert.active && inGame.aiCombatAlert.targetId === p.id;
          const selClass = isSelected ? (side === 'BLUE' ? 'selected-blue' : 'selected-red') : '';
          return `
            <div class="pos-card ${selClass} ${isHotspot ? 'ai-hotspot' : ''}"
                 onclick="sendDirectorAction('SELECT_POSITION', { positionId: '${p.id}' })">
              <img class="pos-avatar" src="${p.champion.squareImg}" alt="${p.champion.name}" />
              <div class="pos-meta">
                <div class="pos-name-row">
                  <span>${p.name}</span>
                  <span class="pos-role-tag">${p.role} [Phím ${p.hotkey}]</span>
                </div>
                <div class="pos-sub-row">
                  <span>${p.champion.name} (Lv.${p.level})</span>
                  <span>${p.kills}/${p.deaths}/${p.assists} | ${p.cs} CS</span>
                </div>
              </div>
            </div>
          `;
        })
        .join('');

    return `
      <div class="director-pane liquid-glass">
        <!-- GROUP 1: SCENE & DRAFT OPERATIONS -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">1. Thao Tác Luồng Cảnh & Cấm/Chọn (Pre-Match & Draft)</span>
            <span class="section-tag">Ván ${meta.gameNumber} (${meta.seriesFormat})</span>
          </div>
          <div class="btn-row">
            <button class="liquid-btn ${state.scene === 'DRAFT' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_SCENE', { scene: 'DRAFT' })">
              <span>Cấm / Chọn</span>
              <small>Ban/Pick UI</small>
            </button>
            <button class="liquid-btn ${state.scene === 'VS_LOADING' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_SCENE', { scene: 'VS_LOADING' })">
              <span>Đội Hình 5v5</span>
              <small>Chờ Tải Trận</small>
            </button>
            <button class="liquid-btn ${state.scene === 'INGAME' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_SCENE', { scene: 'INGAME' })">
              <span>Trong Trận</span>
              <small>Spectator Live</small>
            </button>
            <button class="liquid-btn ${state.scene === 'POSTGAME' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_SCENE', { scene: 'POSTGAME' })">
              <span>Sau Trận</span>
              <small>Damage & MVP</small>
            </button>
          </div>
          <div class="btn-row-3">
            <button class="liquid-btn ${meta.fearlessDraftEnabled ? 'active' : ''}"
                    onclick="sendDirectorAction('TOGGLE_FEARLESS')">
              <span>Fearless Draft: ${meta.fearlessDraftEnabled ? 'BẬT' : 'TẮT'}</span>
              <small>Đã khóa ${meta.fearlessLockedChampions.length} tướng</small>
            </button>
            <button class="liquid-btn" onclick="sendDirectorAction('DRAFT_STEP_NEXT')">
              <span>Khóa Lượt Tiếp (+1)</span>
              <small>Test Nhanh Ban/Pick</small>
            </button>
            <button class="liquid-btn" onclick="sendDirectorAction('SWAP_SIDES_NEXT_GAME', { winner: 'BLUE' })">
              <span>Xong Ván & Đổi Bên</span>
              <small>+1 Điểm & Lưu Fearless</small>
            </button>
          </div>
        </div>

        <!-- GROUP 2: 10-POSITION SPECTATOR CAMERA SWITCHER + AI MINIMAP RADAR -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">2. Chọn Vị Trí & Lia Camera Trọng Tài (10 Tuyển Thủ)</span>
            <span class="section-tag">Đang soi: ${director.selectedRole} (Phím ${director.cameraHotkey})</span>
          </div>

          <div class="ai-alert-banner">
            <div>
              <strong style="color:#fde047;">[AI MINIMAP RADAR - ${inGame.aiCombatAlert.confidence}%]:</strong>
              <span>${inGame.aiCombatAlert.zoneName} — ${inGame.aiCombatAlert.reason}</span>
            </div>
            <button class="liquid-glass-pill ${director.aiAutoDirector ? 'active' : ''}"
                    style="padding:5px 11px; font-size:11px; font-weight:800; white-space:nowrap;"
                    onclick="sendDirectorAction('TOGGLE_AI_DIRECTOR')">
              AI Tự Lia: ${director.aiAutoDirector ? 'BẬT' : 'TẮT'}
            </button>
          </div>

          <div class="positions-matrix">
            <div class="team-column">
              <div class="team-col-header blue">
                <span>ĐỘI XANH: ${blueTeam.code}</span>
                <span>Phím 1..5</span>
              </div>
              ${renderTeamPosButtons(blueTeam, 'BLUE')}
            </div>
            <div class="team-column">
              <div class="team-col-header red">
                <span>ĐỘI ĐỎ: ${redTeam.code}</span>
                <span>Phím Q..T</span>
              </div>
              ${renderTeamPosButtons(redTeam, 'RED')}
            </div>
          </div>
        </div>

        <!-- GROUP 3: 4 CORE BIG-TOURNAMENT LIVE OPERATIONS -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">3. Bốn Nút Nghiệp Vụ Đặc Trưng Giải Lớn (LCK / Worlds)</span>
            <span class="section-tag">Port 2999 Replay API</span>
          </div>

          <!-- Operation 3.1: Fog of War Toggle -->
          <div class="btn-row-3">
            <button class="liquid-btn ${director.fogOfWar === 'ALL' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_FOG_OF_WAR', { mode: 'ALL' })">
              <span>Sương Mù: Cả 2 Đội</span>
              <small>Thấy Toàn Bản Đồ</small>
            </button>
            <button class="liquid-btn ${director.fogOfWar === 'BLUE' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_FOG_OF_WAR', { mode: 'BLUE' })">
              <span>Tầm Nhìn ${blueTeam.code} (Xanh)</span>
              <small>Soi Kiểm Soát Mắt</small>
            </button>
            <button class="liquid-btn ${director.fogOfWar === 'RED' ? 'red-active' : ''}"
                    onclick="sendDirectorAction('SET_FOG_OF_WAR', { mode: 'RED' })">
              <span>Tầm Nhìn ${redTeam.code} (Đỏ)</span>
              <small>Soi Kiểm Soát Mắt</small>
            </button>
          </div>

          <!-- Operation 3.2: Bottom Dock Switcher -->
          <div class="btn-row-3">
            <button class="liquid-btn ${director.bottomPanelMode === 'MATCHUP_1V1' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_BOTTOM_PANEL', { mode: 'MATCHUP_1V1' })">
              <span>Bảng Đáy: So Kè 1v1</span>
              <small>${director.selectedRole} Xanh vs ${director.selectedRole} Đỏ</small>
            </button>
            <button class="liquid-btn ${director.bottomPanelMode === 'TABLE_10' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_BOTTOM_PANEL', { mode: 'TABLE_10' })">
              <span>Bảng Đáy: 10 Tuyển Thủ</span>
              <small>Đủ 6 Món Trang Bị</small>
            </button>
            <button class="liquid-btn ${director.bottomPanelMode === 'GOLD_GRAPH' ? 'active' : ''}"
                    onclick="sendDirectorAction('SET_BOTTOM_PANEL', { mode: 'GOLD_GRAPH' })">
              <span>Bảng Đáy: Biểu Đồ Vàng</span>
              <small>Chênh Lệch Theo Phút</small>
            </button>
          </div>

          <!-- Operation 3.3 & 3.4: Instant Replay 15s + Technical Pause + Simulate Combat -->
          <div class="btn-row-3">
            <button class="liquid-btn ${director.replayActive ? 'red-active' : ''}"
                    onclick="sendDirectorAction('TRIGGER_REPLAY_15S')">
              <span>Phát Lại Replay 15s</span>
              <small>${director.replayActive ? `Đang chiếu (${director.replayCountdown}s)` : 'Tua Lùi Pha Combat'}</small>
            </button>
            <button class="liquid-btn ${director.technicalPause ? 'red-active' : ''}"
                    onclick="sendDirectorAction('TOGGLE_PAUSE')">
              <span>Tạm Dừng Kỹ Thuật</span>
              <small>${director.technicalPause ? 'ĐANG PAUSE' : 'Bật Màn Hình Chờ'}</small>
            </button>
            <button class="liquid-btn" onclick="sendDirectorAction('SIMULATE_TEAMFIGHT')">
              <span>Giả Lập Pha Combat</span>
              <small>Test Nhảy Mạng & AI</small>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // RENDER 2: 16:9 LCK / WORLDS BROADCAST LIVE STAGE (DRAFT / INGAME / POST)
  // ==========================================================================
  function renderStage169(state) {
    const { meta, director, inGame, blueTeam, redTeam } = state;
    const goldDiff = blueTeam.gold - redTeam.gold;
    const goldLeader = goldDiff >= 0 ? blueTeam.code : redTeam.code;
    const fogClass = director.fogOfWar === 'BLUE' ? 'fog-blue' : director.fogOfWar === 'RED' ? 'fog-red' : '';

    // Top Scoreboard Bar (Shared across scenes)
    const renderSeriesDots = (score, side) => {
      const totalWinsNeeded = meta.seriesFormat === 'BO5' ? 3 : meta.seriesFormat === 'BO3' ? 2 : 1;
      const dots = [];
      for (let i = 0; i < totalWinsNeeded; i++) {
        dots.push(`<div class="series-dot ${i < score ? (side === 'BLUE' ? 'won-blue' : 'won-red') : ''}"></div>`);
      }
      return `<div class="hud-series-boxes">${dots.join('')}</div>`;
    };

    const topScoreboardHtml = `
      <div class="hud-top-wrapper">
        <div class="hud-top-bar liquid-glass">
          <div class="hud-team-side blue">
            <span class="hud-team-code blue">${blueTeam.code}</span>
            ${renderSeriesDots(blueTeam.score, 'BLUE')}
            <span class="hud-stat-pill">Vàng: ${formatGold(blueTeam.gold)}</span>
            <span class="hud-stat-pill">Trụ: ${blueTeam.towers} | Rồng: ${blueTeam.dragons.length}</span>
          </div>

          <div class="hud-center-kills">
            <span class="kill-num blue">${blueTeam.kills}</span>
            <div class="game-clock-box">
              <span class="game-clock">${formatTime(inGame.gameTimeSeconds)}</span>
              <span class="gold-diff-badge">${goldLeader} +${formatGold(Math.abs(goldDiff))}</span>
            </div>
            <span class="kill-num red">${redTeam.kills}</span>
          </div>

          <div class="hud-team-side red">
            <span class="hud-stat-pill">Rồng: ${redTeam.dragons.length} | Trụ: ${redTeam.towers}</span>
            <span class="hud-stat-pill">Vàng: ${formatGold(redTeam.gold)}</span>
            ${renderSeriesDots(redTeam.score, 'RED')}
            <span class="hud-team-code red">${redTeam.code}</span>
          </div>
        </div>

        <div class="hud-sub-row">
          ${
            inGame.baronPowerPlay.active
              ? `<div class="baron-powerplay-pill">
                   BARON POWER PLAY (${inGame.baronPowerPlay.team}): +${inGame.baronPowerPlay.goldSwing}G | ${formatTime(inGame.baronPowerPlay.remainingSeconds)}
                 </div>`
              : ''
          }
          <div class="dragon-timer-pill liquid-glass">
            Rồng tiếp theo: ${inGame.nextDragon.type} (${formatTime(inGame.nextDragon.spawnInSeconds)})
          </div>
          <div class="dragon-timer-pill liquid-glass">
            Tầm nhìn Trọng tài: ${director.fogOfWar === 'ALL' ? 'CẢ 2 ĐỘI (100%)' : director.fogOfWar === 'BLUE' ? `CHỈ ĐỘI XANH (${blueTeam.code})` : `CHỈ ĐỘI ĐỎ (${redTeam.code})`}
          </div>
        </div>
      </div>
    `;

    // Scene A: Cloned RCVolus Pick/Ban Draft Overlay
    if (state.scene === 'DRAFT') {
      const renderDraftSide = (team, bans) => `
        <div>
          <div class="draft-picks-row">
            ${team.players
              .map(
                (p) => `
              <div class="draft-pick-card">
                <img class="splash" src="${p.champion.loadingImg}" alt="${p.champion.name}" />
                <div class="draft-pick-overlay">
                  <span style="font-size:9px; color:#94a3b8; font-weight:700;">${p.role}</span>
                  <span style="font-size:12px; font-weight:800;">${p.name}</span>
                  <span style="font-size:10px; color:#38bdf8;">${p.champion.name}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="draft-bans-row">
            ${[0, 1, 2, 3, 4]
              .map((idx) => {
                const b = bans[idx];
                return `
                  <div class="ban-square">
                    ${b ? `<img src="${b.squareImg}" alt="${b.name}" title="Cấm: ${b.name}" />` : ''}
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `;

      return `
        <div class="stage-169">
          <div class="rift-map-backdrop"></div>
          ${topScoreboardHtml}
          <div class="draft-scene-container">
            ${
              meta.fearlessDraftEnabled
                ? `<div class="fearless-bar liquid-glass">
                     <span style="color:#fde047;">FEARLESS DRAFT (Tướng Đã Khóa Các Ván Trước):</span>
                     ${meta.fearlessLockedChampions
                       .map(
                         (c) => `
                       <div class="fearless-chip">
                         <img src="${c.squareImg}" alt="${c.name}" />
                         <span>${c.name}</span>
                       </div>
                     `
                       )
                       .join('')}
                   </div>`
                : ''
            }
            <div class="draft-columns-grid">
              ${renderDraftSide(blueTeam, state.draft.blueBans)}
              <div class="liquid-glass" style="padding:16px; text-align:center; border-radius:20px;">
                <div style="font-size:11px; color:#94a3b8; font-weight:700;">${meta.tournamentName}</div>
                <div style="font-size:34px; font-weight:900; margin:6px 0; color:#38bdf8;">:${String(state.draft.timer).padStart(2, '0')}</div>
                <div style="font-size:11px; font-weight:800; color:#fde047;">${state.draft.phaseLabel}</div>
              </div>
              ${renderDraftSide(redTeam, state.draft.redBans)}
            </div>
          </div>
        </div>
      `;
    }

    // Scene B: VS 5v5 Lineup (Spectator Buffer Bridge)
    if (state.scene === 'VS_LOADING') {
      return `
        <div class="stage-169">
          <div class="rift-map-backdrop"></div>
          ${topScoreboardHtml}
          <div class="draft-scene-container" style="justify-content:center; align-items:center; gap:16px;">
            <div class="liquid-glass" style="padding:20px 28px; width:92%; text-align:center;">
              <div style="font-size:12px; color:#fde047; font-weight:800; letter-spacing:0.1em;">ĐỘI HÌNH RA QUÂN 5V5 — ĐANG ĐỒNG BỘ MÁY TRỌNG TÀI (SPECTATOR OVERVIEW)</div>
              <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:18px; align-items:center; margin-top:16px;">
                <div>
                  <h3 style="color:#38bdf8; margin-bottom:10px;">${blueTeam.name} (${blueTeam.code})</h3>
                  <div class="draft-picks-row">
                    ${blueTeam.players
                      .map(
                        (p) => `
                      <div class="draft-pick-card" style="height:150px;">
                        <img class="splash" src="${p.champion.loadingImg}" />
                        <div class="draft-pick-overlay">
                          <span style="font-size:11px; font-weight:800;">${p.name}</span>
                          <span style="font-size:10px; color:#7dd3fc;">${p.champion.name}</span>
                        </div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
                <div style="font-size:28px; font-weight:900; color:#fbbf24;">VS</div>
                <div>
                  <h3 style="color:#fb7185; margin-bottom:10px;">${redTeam.name} (${redTeam.code})</h3>
                  <div class="draft-picks-row">
                    ${redTeam.players
                      .map(
                        (p) => `
                      <div class="draft-pick-card" style="height:150px;">
                        <img class="splash" src="${p.champion.loadingImg}" />
                        <div class="draft-pick-overlay">
                          <span style="font-size:11px; font-weight:800;">${p.name}</span>
                          <span style="font-size:10px; color:#fda4af;">${p.champion.name}</span>
                        </div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Scene C: Post-Game Damage Dealt Chart & MVP
    if (state.scene === 'POSTGAME') {
      const allPlayers = [...blueTeam.players, ...redTeam.players];
      const maxDmg = Math.max(...allPlayers.map((p) => p.damageDealt), 1);
      const mvp = [...blueTeam.players].sort((a, b) => b.damageDealt + b.kills * 1500 - (a.damageDealt + a.kills * 1500))[0];

      return `
        <div class="stage-169">
          <div class="rift-map-backdrop"></div>
          ${topScoreboardHtml}
          <div class="draft-scene-container" style="justify-content:center; align-items:center;">
            <div class="liquid-glass" style="padding:18px 24px; width:92%; display:grid; grid-template-columns:250px 1fr; gap:20px;">
              <div style="background:rgba(14,165,233,0.14); border:1px solid rgba(56,189,248,0.45); border-radius:16px; padding:14px; text-align:center;">
                <div style="font-size:11px; font-weight:800; color:#fde047;">MVP VÁN ${meta.gameNumber}</div>
                <img src="${mvp.champion.squareImg}" style="width:76px; height:76px; border-radius:16px; margin:10px 0; border:2px solid #fbbf24;" />
                <div style="font-size:18px; font-weight:900;">${mvp.name}</div>
                <div style="font-size:12px; color:#7dd3fc;">${mvp.champion.name} (${mvp.role})</div>
                <div style="margin-top:8px; font-size:14px; font-weight:800; color:#fde047;">
                  KDA: ${mvp.kills}/${mvp.deaths}/${mvp.assists} | ${mvp.damageDealt.toLocaleString()} DMG
                </div>
              </div>
              <div>
                <div style="font-size:12px; font-weight:800; color:#bae6fd; margin-bottom:10px;">THỐNG KÊ SÁT THƯƠNG LÊN TƯỚNG (POST-GAME DAMAGE CHART)</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                  ${allPlayers
                    .map((p) => {
                      const pct = Math.round((p.damageDealt / maxDmg) * 100);
                      const isBlue = p.id.startsWith('BLUE');
                      return `
                        <div style="display:flex; align-items:center; gap:8px; font-size:11px;">
                          <img src="${p.champion.squareImg}" style="width:26px; height:26px; border-radius:6px;" />
                          <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; font-weight:700;">
                              <span>${p.name}</span>
                              <span>${p.damageDealt.toLocaleString()}</span>
                            </div>
                            <div class="hp-bar-track" style="height:7px;">
                              <div style="width:${pct}%; height:100%; background:${isBlue ? '#38bdf8' : '#fb7185'};"></div>
                            </div>
                          </div>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Scene D (Default): IN-GAME SPECTATOR OVERVIEW + BOTTOM DIRECTOR DOCK
    const { role, bluePlayer, redPlayer, activePlayer } = getSelectedPair(state);

    const renderSideFrame = (p) => `
      <div class="side-player-frame liquid-glass ${director.selectedPositionId === p.id ? 'focused' : ''}"
           onclick="sendDirectorAction('SELECT_POSITION', { positionId: '${p.id}' })"
           style="cursor:pointer;">
        <img class="side-champ-img" src="${p.champion.squareImg}" alt="${p.champion.name}" />
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; font-weight:700;">
            <span>${p.name}</span>
            <span style="color:#fde047;">Lv.${p.level}</span>
          </div>
          <div class="hp-bar-track">
            <div class="hp-bar-fill" style="width:${p.respawnTimer > 0 ? 0 : p.hpPercent}%;"></div>
          </div>
        </div>
      </div>
    `;

    // Bottom Dock Content (1v1 Matchup / 10-Player Table / Gold Graph)
    let bottomDockContent = '';
    if (director.bottomPanelMode === 'MATCHUP_1V1') {
      const roleDiff = bluePlayer.gold - redPlayer.gold;
      bottomDockContent = `
        <div class="matchup-1v1-grid">
          <div class="matchup-Fighter blue">
            <img class="matchup-portrait" src="${bluePlayer.champion.squareImg}" />
            <div>
              <div style="font-size:14px; font-weight:900; color:#38bdf8;">${bluePlayer.name} (${bluePlayer.champion.name})</div>
              <div style="font-size:11px; color:#cbd5e1;">KDA: ${bluePlayer.kills}/${bluePlayer.deaths}/${bluePlayer.assists} | ${bluePlayer.cs} CS | ${formatGold(bluePlayer.gold)}</div>
              <div class="items-strip">
                ${bluePlayer.items.map((it) => `<img class="item-slot-img" src="${it}" />`).join('')}
              </div>
            </div>
          </div>

          <div style="text-align:center; padding:6px 14px; border-radius:14px; background:rgba(255,255,255,0.07);">
            <div style="font-size:10px; color:#94a3b8; font-weight:800;">SO KÈ VỊ TRÍ ${role}</div>
            <div style="font-size:18px; font-weight:900; color:#fbbf24; margin:2px 0;">
              ${roleDiff >= 0 ? `${blueTeam.code} +${roleDiff}G` : `${redTeam.code} +${Math.abs(roleDiff)}G`}
            </div>
            <div style="font-size:10px; color:#7dd3fc;">Camera Trọng Tài: ${activePlayer.name}</div>
          </div>

          <div class="matchup-Fighter red">
            <img class="matchup-portrait" src="${redPlayer.champion.squareImg}" />
            <div>
              <div style="font-size:14px; font-weight:900; color:#fb7185;">${redPlayer.name} (${redPlayer.champion.name})</div>
              <div style="font-size:11px; color:#cbd5e1;">KDA: ${redPlayer.kills}/${redPlayer.deaths}/${redPlayer.assists} | ${redPlayer.cs} CS | ${formatGold(redPlayer.gold)}</div>
              <div class="items-strip" style="justify-content:flex-end;">
                ${redPlayer.items.map((it) => `<img class="item-slot-img" src="${it}" />`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (director.bottomPanelMode === 'TABLE_10') {
      bottomDockContent = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:11px;">
          <div>
            ${blueTeam.players
              .map(
                (p) => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:2px 0;">
                <span style="font-weight:700; color:#7dd3fc; width:95px;">${p.name}</span>
                <span>${p.kills}/${p.deaths}/${p.assists} (${p.cs} CS)</span>
                <span style="color:#fde047;">${formatGold(p.gold)}</span>
                <div style="display:flex; gap:2px;">
                  ${p.items.map((it) => `<img src="${it}" style="width:16px; height:16px; border-radius:3px;" />`).join('')}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <div>
            ${redTeam.players
              .map(
                (p) => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:2px 0;">
                <div style="display:flex; gap:2px;">
                  ${p.items.map((it) => `<img src="${it}" style="width:16px; height:16px; border-radius:3px;" />`).join('')}
                </div>
                <span style="color:#fde047;">${formatGold(p.gold)}</span>
                <span>${p.kills}/${p.deaths}/${p.assists} (${p.cs} CS)</span>
                <span style="font-weight:700; color:#fda4af; width:95px; text-align:right;">${p.name}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    } else {
      bottomDockContent = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:18px;">
          <div>
            <div style="font-size:11px; font-weight:800; color:#fde047;">BIỂU ĐỒ CHÊNH LỆCH VÀNG THEO THỜI GIAN (GOLD ADVANTAGE TIMELINE)</div>
            <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">
              Hiện tại (${formatTime(inGame.gameTimeSeconds)}): <strong style="color:#38bdf8;">${goldLeader} dẫn trước +${ Math.abs(goldDiff).toLocaleString() } Vàng</strong>
            </div>
          </div>
          <div style="display:flex; align-items:flex-end; gap:14px; height:64px; padding:6px 14px; background:rgba(255,255,255,0.06); border-radius:12px;">
            ${inGame.goldHistory
              .map((pt) => {
                const h = Math.min(46, Math.max(10, Math.round(Math.abs(pt.diff) / 110)));
                const color = pt.diff >= 0 ? '#38bdf8' : '#fb7185';
                return `
                  <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                    <div style="width:24px; height:${h}px; background:${color}; border-radius:4px;"></div>
                    <span style="font-size:9px; color:#94a3b8;">${pt.min}p (${pt.diff > 0 ? '+' : ''}${pt.diff})</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="stage-169">
        <div class="rift-map-backdrop ${fogClass}"></div>
        ${topScoreboardHtml}

        <!-- Replay 15s PiP Floating Box -->
        ${
          director.replayActive
            ? `<div class="replay-pip-badge liquid-glass">
                 <div style="font-size:11px; font-weight:900; color:#fb7185;">[REPLAY 15 GIÂY - TUA LÙI CỔNG 2999]</div>
                 <div style="font-size:11px; margin-top:4px;">Đang phát lại pha giao tranh tại ${inGame.aiCombatAlert.zoneName}</div>
                 <div style="font-size:12px; font-weight:800; color:#fde047; margin-top:4px;">Tự quay về Live sau: ${director.replayCountdown}s</div>
               </div>`
            : ''
        }

        <!-- Technical Pause Full Modal -->
        ${
          director.technicalPause
            ? `<div class="pause-modal-overlay">
                 <div class="liquid-glass" style="padding:28px 42px; text-align:center;">
                   <div style="font-size:12px; font-weight:800; color:#fb7185; letter-spacing:0.12em;">THÔNG BÁO TỪ TRỌNG TÀI GIẢI ĐẤU</div>
                   <div style="font-size:26px; font-weight:900; margin:8px 0;">TẠM DỪNG KỸ THUẬT (TECHNICAL PAUSE)</div>
                   <div style="font-size:13px; color:#94a3b8;">Trận đấu giữa ${blueTeam.code} và ${redTeam.code} sẽ tiếp tục trong giây lát.</div>
                 </div>
               </div>`
            : ''
        }

        <!-- Middle Spectator Overview Arena -->
        <div class="spectator-center-arena">
          <div class="side-team-frames">
            ${blueTeam.players.map(renderSideFrame).join('')}
          </div>

          <!-- Center Tactical Spectator Camera & Minimap Overview -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
            <div class="liquid-glass" style="padding:7px 14px; border-radius:999px; font-size:11px; font-weight:700;">
              Góc nhìn Trọng tài (Spectator Overview) -> Đang chiếu: <strong style="color:#fde047;">${activePlayer.name} (${activePlayer.champion.name} - ${activePlayer.role})</strong>
            </div>

            <div class="tactical-overview-box liquid-glass">
              <div class="map-lane-diagonal"></div>
              ${[...blueTeam.players, ...redTeam.players]
                .map((p) => {
                  const isBlue = p.id.startsWith('BLUE');
                  const isCam = director.selectedPositionId === p.id;
                  return `
                    <img class="map-token ${isBlue ? 'blue' : 'red'} ${isCam ? 'active-cam' : ''}"
                         src="${p.champion.squareImg}"
                         title="${p.name} (${p.role})"
                         style="left:${p.mapPos.x}%; top:${p.mapPos.y}%;"
                         onclick="sendDirectorAction('SELECT_POSITION', { positionId: '${p.id}' })" />
                  `;
                })
                .join('')}
            </div>

            <div style="display:flex; gap:8px;">
              ${inGame.killFeed
                .slice(0, 2)
                .map(
                  (kf) => `
                <div class="liquid-glass" style="padding:4px 10px; border-radius:999px; font-size:10px;">
                  <strong style="color:#38bdf8;">${kf.killer}</strong> -> ${kf.victim}
                  <span style="color:#fde047; font-weight:800; margin-left:4px;">[${kf.badge}]</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="side-team-frames">
            ${redTeam.players.map(renderSideFrame).join('')}
          </div>
        </div>

        <!-- Bottom Director Dock -->
        <div class="hud-bottom-dock liquid-glass">
          ${bottomDockContent}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // RENDER 3: 9:16 TIKTOK SMART AUTO-CROP VERTICAL STAGE
  // ==========================================================================
  function renderStage916(state) {
    const { blueTeam, redTeam, inGame, director } = state;
    const { activePlayer, bluePlayer, redPlayer, role } = getSelectedPair(state);

    return `
      <div class="stage-916">
        <div class="liquid-glass" style="padding:8px 12px; border-radius:14px; text-align:center;">
          <div style="font-size:10px; font-weight:800; color:#fde047;">LUỒNG DỌC 9:16 TIKTOK (AI AUTO-CROP)</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:16px; font-weight:900; color:#38bdf8;">${blueTeam.code} ${blueTeam.kills}</span>
            <span style="font-size:12px; font-weight:800;">${formatTime(inGame.gameTimeSeconds)}</span>
            <span style="font-size:16px; font-weight:900; color:#fb7185;">${redTeam.kills} ${redTeam.code}</span>
          </div>
        </div>

        <div class="liquid-glass" style="flex:1; margin:10px 0; border-radius:16px; padding:12px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; gap:8px;">
          <div style="font-size:10px; color:#7dd3fc; font-weight:700;">KHUNG CẮT DỌC TỰ ĐỘNG BÁM THEO CAMERA TRỌNG TÀI</div>
          <img src="${activePlayer.champion.loadingImg}" style="width:118px; height:175px; object-fit:cover; border-radius:14px; border:2px solid #fbbf24;" />
          <div style="font-size:15px; font-weight:900;">${activePlayer.name}</div>
          <div style="font-size:11px; color:#fde047;">${activePlayer.champion.name} (${activePlayer.role}) — KDA ${activePlayer.kills}/${activePlayer.deaths}/${activePlayer.assists}</div>
        </div>

        <div class="liquid-glass" style="padding:8px 10px; border-radius:14px; font-size:11px;">
          <div style="text-align:center; font-weight:800; color:#bae6fd; margin-bottom:4px;">SO KÈ NHANH ${role}</div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#38bdf8; font-weight:700;">${bluePlayer.name}: ${formatGold(bluePlayer.gold)}</span>
            <span style="color:#fb7185; font-weight:700;">${redPlayer.name}: ${formatGold(redPlayer.gold)}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // MASTER SHELL RENDER
  // ==========================================================================
  function renderApp() {
    if (!appState) return;
    const root = document.getElementById('app');

    const ipadUrl = `http://${lanInfo.lanIp}:${lanInfo.port}/?view=director`;

    let workspaceContent = '';
    if (currentView === 'director') {
      workspaceContent = `
        <div class="workspace-grid mode-director">
          ${renderDirectorPane(appState)}
        </div>
      `;
    } else if (currentView === 'overlay169') {
      workspaceContent = `
        <div class="workspace-grid mode-overlay169">
          <div class="broadcast-pane">
            <div class="monitors-row single-169">
              ${renderStage169(appState)}
            </div>
          </div>
        </div>
      `;
    } else if (currentView === 'overlay916') {
      workspaceContent = `
        <div class="workspace-grid mode-overlay916">
          <div class="broadcast-pane">
            <div class="monitors-row single-916">
              ${renderStage916(appState)}
            </div>
          </div>
        </div>
      `;
    } else {
      // Full Studio All-in-One Mode (Left: Director Touch Deck | Right: 16:9 + 9:16 Live Broadcast Monitors)
      workspaceContent = `
        <div class="workspace-grid">
          ${renderDirectorPane(appState)}
          <div class="broadcast-pane">
            <div class="monitors-row">
              ${renderStage169(appState)}
              ${renderStage916(appState)}
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = `
      <header class="top-nav liquid-glass">
        <div class="brand-cluster">
          <span class="brand-badge">LIQUID GLASS PC STUDIO</span>
          <div>
            <div class="brand-title">LoL Broadcast Studio & Bàn Đạo Diễn Giải Đấu 5v5</div>
            <div class="brand-sub">Mở trên iPad cùng mạng Wi-Fi: <strong>${ipadUrl}</strong></div>
          </div>
        </div>

        <div class="view-switcher">
          <button class="liquid-glass-pill ${currentView === 'studio' ? 'active' : ''}"
                  onclick="setViewMode('studio')">
            Studio Tổng Hợp (PC)
          </button>
          <button class="liquid-glass-pill ${currentView === 'director' ? 'active' : ''}"
                  onclick="setViewMode('director')">
            Bàn Đạo Diễn (iPad / Touch)
          </button>
          <button class="liquid-glass-pill ${currentView === 'overlay169' ? 'active' : ''}"
                  onclick="setViewMode('overlay169')">
            Màn Hình Live 16:9
          </button>
          <button class="liquid-glass-pill ${currentView === 'overlay916' ? 'active' : ''}"
                  onclick="setViewMode('overlay916')">
            Màn Hình TikTok 9:16
          </button>
        </div>

        <div class="status-cluster">
          <span class="status-chip">
            ${
              appState.meta.live2999Connected
                ? 'PORT 2999 LIVE (0.00s)'
                : appState.meta.lcuConnected
                ? 'LCU CLIENT CONNECTED'
                : 'GIẢ LẬP LCK (T1 vs GEN) SẴN SÀNG'
            }
          </span>
        </div>
      </header>

      ${workspaceContent}
    `;
  }

  connectWebSocket();
})();
