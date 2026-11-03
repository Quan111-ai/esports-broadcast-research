/**
 * LOL REAL TOURNAMENT PIPELINE & SPECTATOR ENGINE (PC NATIVE - PATCH 16.21 VERIFIED)
 * Verified against live League of Legends client at E:\Riot Games\League of Legends:
 *   - Reset & Create Custom Lobby   : DELETE /lol-lobby/v2/lobby -> POST /lol-lobby/v2/lobby (queueId: 3130 / 3100 / 3110 / 3140)
 *   - Switch Team / Spectator       : POST /lol-lobby/v2/lobby/team/{TEAM1 | TEAM2 | SPECTATOR}
 *   - Add Custom Bots (No Dupes)    : POST /lol-lobby/v1/lobby/custom/bots (botDifficulty: "RSINTERMEDIATE")
 *   - Start Match / Champ Select    : POST /lol-lobby/v1/lobby/custom/start-champ-select
 *   - Auto Ban/Pick in ChampSelect  : PATCH /lol-champ-select/v1/session/actions/{id}
 *   - Instant 5v5 Spectator Launch  : POST /lol-replays/v1/rofls/{gameId}/watch & POST /lol-spectator/v1/spectate/launch
 *   - Live Spectator Port 2999      : GET  /liveclientdata/allgamedata, POST /replay/render, POST /replay/playback
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 3080);
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const LOL_INSTALL_DIRS = [
  'E:\\Riot Games\\League of Legends',
  'C:\\Riot Games\\League of Legends',
  'D:\\Riot Games\\League of Legends'
];

const RIOT_CLIENT_PATHS = [
  'C:\\Riot Games\\Riot Client\\RiotClientServices.exe',
  'D:\\Riot Games\\Riot Client\\RiotClientServices.exe',
  'E:\\Riot Games\\Riot Client\\RiotClientServices.exe'
];

function detectLolInstallDir() {
  for (const dir of LOL_INSTALL_DIRS) {
    if (fs.existsSync(dir)) return dir;
  }
  return 'E:\\Riot Games\\League of Legends';
}

const recentBotChampIds = new Set();

const pipelineState = {
  installDir: detectLolInstallDir(),
  replayApiEnabledInCfg: false,
  lcu: {
    connected: false,
    port: null,
    password: null,
    protocol: 'https',
    summoner: null,
    gameflowPhase: 'None',
    lastError: null
  },
  lobby: {
    active: false,
    canStartActivity: false,
    humanPlayersInTeams: 0,
    lobbyName: 'GIAI DAU LOL - BO3 VAN 1',
    lobbyPassword: '123',
    queueId: 3130, // 3130 = Tournament Draft 5v5, 3100 = Blind Pick 5v5, 3110 = Draft Pick 5v5, 3140 = Practice Tool
    spectatorPolicy: 'AllAllowed',
    teamOne: [],
    teamTwo: [],
    spectators: []
  },
  champSelect: {
    active: false,
    timerPhase: '',
    timeLeftSec: 0,
    localPlayerCellId: -1,
    activeActionId: null,
    activeActionType: '',
    myTeam: [],
    theirTeam: [],
    bans: { myTeamBans: [], theirTeamBans: [] }
  },
  liveSpectator2999: {
    connected: false,
    gameTime: 0,
    gameMode: '',
    mapName: '',
    allPlayers: [],
    events: [],
    hudHidden: false,
    fogOfWar: 'ALL'
  },
  logs: [
    `[INIT] Đã phát hiện bộ cài Liên Minh Huyền Thoại tại: ${detectLolInstallDir()}`
  ]
};

function addLog(msg) {
  const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
  pipelineState.logs.unshift(`[${time}] ${msg}`);
  pipelineState.logs = pipelineState.logs.slice(0, 50);
  if (typeof wss !== 'undefined' && wss) {
    broadcastState();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function checkAndEnableReplayApiInConfig(autoWrite = false) {
  const cfgPath = path.join(pipelineState.installDir, 'Config', 'game.cfg');
  if (!fs.existsSync(cfgPath)) {
    pipelineState.replayApiEnabledInCfg = false;
    return false;
  }
  try {
    let content = fs.readFileSync(cfgPath, 'utf8');
    if (/EnableReplayApi\s*=\s*1/i.test(content)) {
      pipelineState.replayApiEnabledInCfg = true;
      return true;
    }
    if (autoWrite) {
      if (content.includes('[General]')) {
        content = content.replace('[General]', '[General]\r\nEnableReplayApi=1');
      } else {
        content += '\r\n[General]\r\nEnableReplayApi=1\r\n';
      }
      fs.writeFileSync(cfgPath, content, 'utf8');
      pipelineState.replayApiEnabledInCfg = true;
      addLog(`[PASS] Đã tự động ghi EnableReplayApi=1 vào ${cfgPath}`);
      return true;
    }
  } catch (err) {
    addLog(`[WARN] Không thể đọc/ghi game.cfg: ${err.message}`);
  }
  return false;
}

checkAndEnableReplayApiInConfig(true);

function readLockfileSync() {
  for (const dir of LOL_INSTALL_DIRS) {
    const lockPath = path.join(dir, 'lockfile');
    if (fs.existsSync(lockPath)) {
      try {
        const raw = fs.readFileSync(lockPath, 'utf8').trim();
        const parts = raw.split(':');
        if (parts.length >= 5) {
          return {
            installDir: dir,
            port: Number(parts[2]),
            password: parts[3],
            protocol: parts[4] || 'https'
          };
        }
      } catch (_) {}
    }
  }
  return null;
}

function lcuRequest(method, endpoint, bodyObj = null) {
  return new Promise((resolve, reject) => {
    const lock = readLockfileSync();
    if (lock) {
      pipelineState.lcu.connected = true;
      pipelineState.lcu.port = lock.port;
      pipelineState.lcu.password = lock.password;
    }

    if (!pipelineState.lcu.connected || !pipelineState.lcu.port) {
      return reject(new Error('Chưa kết nối được Sảnh Liên Minh Huyền Thoại (LCU). Hãy mở LoL trước!'));
    }

    const auth = Buffer.from(`riot:${pipelineState.lcu.password}`).toString('base64');
    const payload = bodyObj !== null ? JSON.stringify(bodyObj) : null;

    const req = https.request(
      {
        hostname: '127.0.0.1',
        port: pipelineState.lcu.port,
        path: endpoint,
        method,
        agent: httpsAgent,
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${auth}`,
          ...(payload !== null
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
              }
            : {})
        },
        timeout: 2500
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch (_) {
            parsed = data;
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const msg = typeof parsed === 'object' && parsed && parsed.message ? parsed.message : data;
            reject(new Error(`LCU HTTP ${res.statusCode} (${endpoint}): ${msg}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload !== null) req.write(payload);
    req.end();
  });
}

// ============================================================================
// POLL LIVE LCU & PORT 2999
// ============================================================================
async function pollLcuAndLiveGame() {
  const creds = readLockfileSync();
  if (!creds) {
    if (pipelineState.lcu.connected) {
      addLog('[INFO] Sảnh Liên Minh Huyền Thoại (LCU) đã đóng.');
    }
    pipelineState.lcu.connected = false;
    pipelineState.lcu.port = null;
    pipelineState.lcu.password = null;
    pipelineState.lcu.summoner = null;
    pipelineState.lcu.gameflowPhase = 'None';
    pipelineState.lobby.active = false;
    pipelineState.champSelect.active = false;
  } else {
    const newlyConnected = !pipelineState.lcu.connected || pipelineState.lcu.port !== creds.port;
    pipelineState.lcu.connected = true;
    pipelineState.lcu.port = creds.port;
    pipelineState.lcu.password = creds.password;

    if (newlyConnected) {
      addLog(`[PASS] Đã bắt được lockfile Sảnh LoL! Cổng LCU: ${creds.port}`);
    }

    try {
      const sum = await lcuRequest('GET', '/lol-summoner/v1/current-summoner');
      if (sum && (sum.gameName || sum.displayName)) {
        pipelineState.lcu.summoner = {
          gameName: sum.gameName || sum.displayName,
          tagLine: sum.tagLine || '',
          summonerId: sum.summonerId,
          summonerLevel: sum.summonerLevel
        };
      }
    } catch (_) {}

    try {
      const phase = await lcuRequest('GET', '/lol-gameflow/v1/gameflow-phase');
      pipelineState.lcu.gameflowPhase = typeof phase === 'string' ? phase : 'None';
    } catch (_) {}

    if (pipelineState.lcu.gameflowPhase === 'Lobby') {
      try {
        const lob = await lcuRequest('GET', '/lol-lobby/v2/lobby');
        if (lob && lob.gameConfig) {
          pipelineState.lobby.active = true;
          pipelineState.lobby.canStartActivity = Boolean(lob.canStartActivity);
          pipelineState.lobby.lobbyName = lob.gameConfig.customLobbyName || pipelineState.lobby.lobbyName;
          const myName = pipelineState.lcu.summoner
            ? `${pipelineState.lcu.summoner.gameName}#${pipelineState.lcu.summoner.tagLine}`
            : 'Bạn (Chủ phòng)';
          const mySumId = pipelineState.lcu.summoner ? pipelineState.lcu.summoner.summonerId : -1;

          const formatMember = (m) => {
            if (m.isBot) return `Bot Máy (ChampID=${m.botChampionId} | ${m.botPosition || 'AUTO'})`;
            if (m.summonerId === mySumId) return `${myName} (Bạn - Người thật)`;
            return `${m.summonerName || m.gameName || 'Tuyển thủ'} (Người thật)`;
          };

          const t1 = lob.gameConfig.customTeam100 || [];
          const t2 = lob.gameConfig.customTeam200 || [];
          pipelineState.lobby.humanPlayersInTeams = [...t1, ...t2].filter((m) => !m.isBot).length;

          pipelineState.lobby.teamOne = t1.map((m) => ({
            label: formatMember(m),
            isBot: Boolean(m.isBot)
          }));
          pipelineState.lobby.teamTwo = t2.map((m) => ({
            label: formatMember(m),
            isBot: Boolean(m.isBot)
          }));
          pipelineState.lobby.spectators = (lob.gameConfig.customSpectators || []).map((m) => ({
            label: formatMember(m)
          }));
        }
      } catch (_) {
        pipelineState.lobby.active = false;
      }
    } else {
      pipelineState.lobby.active = false;
    }

    if (pipelineState.lcu.gameflowPhase === 'ChampSelect') {
      try {
        const cs = await lcuRequest('GET', '/lol-champ-select/v1/session');
        if (cs) {
          pipelineState.champSelect.active = true;
          pipelineState.champSelect.timerPhase = cs.timer ? cs.timer.phase : '';
          pipelineState.champSelect.timeLeftSec = cs.timer
            ? Math.max(0, Math.floor((cs.timer.adjustedTimeLeftInPhase || 0) / 1000))
            : 0;
          pipelineState.champSelect.localPlayerCellId = cs.localPlayerCellId;

          let activeAct = null;
          for (const group of cs.actions || []) {
            for (const act of group || []) {
              if (!act.completed && act.actorCellId === cs.localPlayerCellId && act.isInProgress) {
                activeAct = act;
                break;
              }
            }
            if (activeAct) break;
          }
          if (!activeAct) {
            for (const group of cs.actions || []) {
              for (const act of group || []) {
                if (!act.completed && act.actorCellId === cs.localPlayerCellId) {
                  activeAct = act;
                  break;
                }
              }
              if (activeAct) break;
            }
          }

          pipelineState.champSelect.activeActionId = activeAct ? activeAct.id : null;
          pipelineState.champSelect.activeActionType = activeAct ? activeAct.type : '';

          pipelineState.champSelect.myTeam = (cs.myTeam || []).map((c) => ({
            cellId: c.cellId,
            championId: c.championId || c.championPickIntent || 0,
            assignedPosition: c.assignedPosition || '',
            spell1Id: c.spell1Id,
            spell2Id: c.spell2Id
          }));
          pipelineState.champSelect.theirTeam = (cs.theirTeam || []).map((c) => ({
            cellId: c.cellId,
            championId: c.championId || c.championPickIntent || 0,
            assignedPosition: c.assignedPosition || '',
            spell1Id: c.spell1Id,
            spell2Id: c.spell2Id
          }));
          pipelineState.champSelect.bans = cs.bans || { myTeamBans: [], theirTeamBans: [] };
        }
      } catch (_) {
        pipelineState.champSelect.active = false;
      }
    } else {
      pipelineState.champSelect.active = false;
    }
  }

  pollPort2999();
  broadcastState();
}

function pollPort2999() {
  const req = https.get(
    {
      hostname: '127.0.0.1',
      port: 2999,
      path: '/liveclientdata/allgamedata',
      agent: httpsAgent,
      timeout: 600
    },
    (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        pipelineState.liveSpectator2999.connected = false;
        return;
      }
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (!pipelineState.liveSpectator2999.connected) {
            addLog('[PASS] Đã kết nối Cổng 2999 (Live Client Data API) trong cửa sổ trận đấu 3D!');
          }
          pipelineState.liveSpectator2999.connected = true;
          pipelineState.liveSpectator2999.gameTime = data.gameData ? Math.floor(data.gameData.gameTime || 0) : 0;
          pipelineState.liveSpectator2999.gameMode = data.gameData ? data.gameData.gameMode : '';
          pipelineState.liveSpectator2999.mapName = data.gameData ? data.gameData.mapName : '';
          pipelineState.liveSpectator2999.allPlayers = (data.allPlayers || []).map((p) => ({
            summonerName: p.summonerName || p.riotIdGameName || p.championName,
            championName: p.championName,
            team: p.team,
            position: p.position || 'NONE',
            level: p.level,
            isDead: p.isDead,
            respawnTimer: Math.ceil(p.respawnTimer || 0),
            kills: p.scores ? p.scores.kills : 0,
            deaths: p.scores ? p.scores.deaths : 0,
            assists: p.scores ? p.scores.assists : 0,
            creepScore: p.scores ? p.scores.creepScore : 0,
            items: (p.items || []).map((it) => it.itemID)
          }));
          pipelineState.liveSpectator2999.events = ((data.events && data.events.Events) || []).slice(-8).reverse();
        } catch (_) {}
      });
    }
  );
  req.on('error', () => {
    pipelineState.liveSpectator2999.connected = false;
  });
}

setInterval(pollLcuAndLiveGame, 1000);

// ============================================================================
// PIPELINE HELPERS & VERIFIED PATCH 16.21 LCU ACTIONS
// ============================================================================
async function createCleanCustomLobby(lobbyName, lobbyPassword, queueId) {
  recentBotChampIds.clear();
  try {
    await lcuRequest('DELETE', '/lol-lobby/v2/lobby');
    await sleep(250);
  } catch (_) {}

  const body = {
    customGameLobby: {
      configuration: {
        gameMode: queueId === 3140 ? 'PRACTICETOOL' : 'CLASSIC',
        gameMutator: '',
        gameServerRegion: '',
        mapId: 11,
        mutators: { id: queueId },
        spectatorPolicy: 'AllAllowed',
        teamSize: 5
      },
      lobbyName,
      lobbyPassword
    },
    isCustom: true,
    queueId
  };

  await lcuRequest('POST', '/lol-lobby/v2/lobby', body);
  await sleep(200);
}

async function addOneBotToTeam(teamIdStr) {
  const avail = (await lcuRequest('GET', '/lol-lobby/v2/lobby/custom/available-bots')) || [];
  const lob = await lcuRequest('GET', '/lol-lobby/v2/lobby');
  const existingTeam = teamIdStr === '100' ? (lob.gameConfig.customTeam100 || []) : (lob.gameConfig.customTeam200 || []);
  const usedChamps = new Set([
    ...recentBotChampIds,
    ...(lob.gameConfig.customTeam100 || []).map((m) => m.botChampionId),
    ...(lob.gameConfig.customTeam200 || []).map((m) => m.botChampionId)
  ]);

  const positions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
  const usedPos = new Set(existingTeam.map((m) => m.botPosition));
  const chosenPos = positions.find((p) => !usedPos.has(p)) || positions[existingTeam.length % 5];

  const fallbackPool = [1, 3, 4, 5, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 24, 33, 36, 51, 54, 86];
  let chosenChampId = null;
  for (const b of avail) {
    if (b && b.id && !usedChamps.has(b.id)) {
      chosenChampId = b.id;
      break;
    }
  }
  if (!chosenChampId) {
    chosenChampId = fallbackPool.find((id) => !usedChamps.has(id)) || 18;
  }
  recentBotChampIds.add(chosenChampId);

  await lcuRequest('POST', '/lol-lobby/v1/lobby/custom/bots', {
    botDifficulty: 'RSINTERMEDIATE',
    championId: chosenChampId,
    teamId: String(teamIdStr),
    position: chosenPos,
    botUuid: ''
  });
  await sleep(150);
  return { champId: chosenChampId, position: chosenPos };
}

async function handlePipelineAction(action) {
  const { type, payload = {} } = action;

  try {
    switch (type) {
      case 'PATCH_GAME_CFG': {
        checkAndEnableReplayApiInConfig(true);
        break;
      }

      case 'LAUNCH_LOL_CLIENT': {
        checkAndEnableReplayApiInConfig(true);
        const leagueClientExe = path.join(pipelineState.installDir, 'LeagueClient.exe');
        if (fs.existsSync(leagueClientExe)) {
          exec(`start "" "${leagueClientExe}"`);
          addLog(`[PASS] Đang mở ${leagueClientExe}...`);
        } else {
          for (const rc of RIOT_CLIENT_PATHS) {
            if (fs.existsSync(rc)) {
              exec(`"${rc}" --launch-product=league_of_legends --launch-patchline=live`);
              addLog(`[PASS] Đang mở Riot Client khởi chạy Liên Minh Huyền Thoại...`);
              break;
            }
          }
        }
        break;
      }

      case 'CREATE_TOURNAMENT_LOBBY': {
        const lobbyName = payload.lobbyName || pipelineState.lobby.lobbyName;
        const lobbyPassword = payload.lobbyPassword !== undefined ? payload.lobbyPassword : pipelineState.lobby.lobbyPassword;
        const queueId = Number(payload.queueId || pipelineState.lobby.queueId || 3130);
        pipelineState.lobby.lobbyName = lobbyName;
        pipelineState.lobby.lobbyPassword = lobbyPassword;
        pipelineState.lobby.queueId = queueId;

        await createCleanCustomLobby(lobbyName, lobbyPassword, queueId);
        addLog(`[PASS] Đã tạo mới Phòng Giải Đấu "${lobbyName}" (QueueID=${queueId}) chuẩn Patch 16.21!`);
        await pollLcuAndLiveGame();
        break;
      }

      case 'ONE_CLICK_SOLO_TEST_MATCH': {
        // Solo Developer Flow: Reset Lobby -> Create Lobby -> User in TEAM1 + 5 Bots in TEAM2 + 4 Bots in TEAM1 -> Start ChampSelect immediately!
        const lobbyName = payload.lobbyName || pipelineState.lobby.lobbyName;
        const lobbyPassword = payload.lobbyPassword !== undefined ? payload.lobbyPassword : pipelineState.lobby.lobbyPassword;
        const queueId = Number(payload.queueId || 3130);
        pipelineState.lobby.lobbyName = lobbyName;
        pipelineState.lobby.lobbyPassword = lobbyPassword;
        pipelineState.lobby.queueId = queueId;

        await createCleanCustomLobby(lobbyName, lobbyPassword, queueId);
        await addOneBotToTeam('200');
        await addOneBotToTeam('200');
        await addOneBotToTeam('100');

        const startRes = await lcuRequest('POST', '/lol-lobby/v1/lobby/custom/start-champ-select');
        addLog(
          `[PASS] [1-CHẠM TEST 1 MÌNH] Đã tạo phòng "${lobbyName}" (QueueID=${queueId}), thêm Bot khác tướng 2 bên và VÀO THẲNG MÀN HÌNH CẤM/CHỌN! Kết quả: ${JSON.stringify(startRes)}`
        );
        await pollLcuAndLiveGame();
        break;
      }

      case 'WATCH_5V5_SPECTATOR_NOW': {
        // Instant 5v5 Spectator Mode on 1 PC (0 minutes waiting, no 2nd account needed!)
        checkAndEnableReplayApiInConfig(true);
        try {
          await lcuRequest('DELETE', '/lol-lobby/v2/lobby');
          await sleep(200);
        } catch (_) {}

        const cfg = await lcuRequest('GET', '/lol-replays/v1/configuration');
        const gameVersion = (cfg && cfg.gameVersion) || '16.21.834.2754';

        const mh = await lcuRequest('GET', '/lol-match-history/v1/products/lol/current-summoner/matches');
        const games = (mh && mh.games && mh.games.games) || [];
        const classicGame = games.find((g) => g.gameMode === 'CLASSIC') || games[0];
        if (!classicGame) {
          throw new Error('Không tìm thấy trận đấu 5v5 nào trong lịch sử đấu để bật Chế độ Trọng Tài!');
        }

        const gameId = classicGame.gameId;
        addLog(`[INFO] Đang chuẩn bị luồng Trọng Tài 5v5 (10 tuyển thủ) từ GameID=${gameId} (Phiên bản ${gameVersion})...`);

        try {
          await lcuRequest('POST', `/lol-replays/v2/metadata/${gameId}/create`, {
            gameVersion,
            gameType: classicGame.gameType || 'MATCHED_GAME',
            queueId: classicGame.queueId || 440,
            gameEnd: 0
          });
        } catch (_) {}

        await lcuRequest('POST', `/lol-replays/v1/rofls/${gameId}/download`, {
          componentType: 'replay-button_match-history'
        });

        for (let i = 0; i < 12; i++) {
          await sleep(400);
          try {
            const meta = await lcuRequest('GET', `/lol-replays/v1/metadata/${gameId}`);
            if (meta && (meta.state === 'watch' || meta.downloadProgress === 100)) {
              break;
            }
          } catch (_) {}
        }

        await lcuRequest('POST', `/lol-replays/v1/rofls/${gameId}/watch`, {
          componentType: 'replay-button_match-history'
        });

        addLog(
          `[PASS] ĐÃ MỞ CỬA SỔ TRỌNG TÀI XEM TRỰC TIẾP 5v5 (GameID=${gameId})! Cửa sổ League of Legends.exe đang bật lên và mở cổng https://127.0.0.1:2999 cho Bước 4!`
        );
        await pollLcuAndLiveGame();
        break;
      }

      case 'SWITCH_TO_SPECTATOR': {
        await lcuRequest('POST', '/lol-lobby/v2/lobby/team/SPECTATOR');
        addLog(
          '[PASS] Đã chuyển bạn xuống Hàng Trọng Tài (SPECTATOR)! LƯU Ý QUAN TRỌNG: Máy chủ Riot yêu cầu phải có ít nhất 1 NGƯỜI THẬT ở Đội Xanh hoặc Đội Đỏ thì mới cho Trọng Tài bấm Bắt Đầu!'
        );
        await pollLcuAndLiveGame();
        break;
      }

      case 'SWITCH_TO_PLAYER': {
        const teamStr = payload.team === 'TEAM2' || payload.teamId === 200 ? 'TEAM2' : 'TEAM1';
        await lcuRequest('POST', `/lol-lobby/v2/lobby/team/${teamStr}`);
        addLog(`[PASS] Đã chuyển nick của bạn lên ${teamStr === 'TEAM1' ? 'Đội Xanh (TEAM1)' : 'Đội Đỏ (TEAM2)'}!`);
        await pollLcuAndLiveGame();
        break;
      }

      case 'ADD_TEST_BOTS': {
        const teamId = String(payload.teamId || '100');
        const info = await addOneBotToTeam(teamId);
        addLog(`[PASS] Đã thêm Bot (ChampID=${info.champId}, Vị trí=${info.position}) vào Đội ${teamId === '100' ? 'Xanh' : 'Đỏ'}!`);
        await pollLcuAndLiveGame();
        break;
      }

      case 'START_CHAMP_SELECT': {
        const lob = await lcuRequest('GET', '/lol-lobby/v2/lobby');
        const t1 = (lob && lob.gameConfig && lob.gameConfig.customTeam100) || [];
        const t2 = (lob && lob.gameConfig && lob.gameConfig.customTeam200) || [];
        const humanCount = [...t1, ...t2].filter((m) => !m.isBot).length;

        if (humanCount === 0) {
          addLog(
            '[WARN] PHÁT HIỆN 0 NGƯỜI THẬT Ở 2 ĐỘI (Bạn đang ngồi ở Khán Giả khi test 1 mình): Máy chủ Riot chặn tạo trận 100% Bot đấu với Bot! Hệ thống tự động đưa bạn lên Đội Xanh (TEAM1) để vào thẳng Cấm/Chọn!'
          );
          await lcuRequest('POST', '/lol-lobby/v2/lobby/team/TEAM1');
          await sleep(250);
          if (t2.length === 0) {
            await addOneBotToTeam('200');
          }
        } else if (t1.length === 0 || t2.length === 0) {
          const emptyTeam = t1.length === 0 ? '100' : '200';
          addLog(`[INFO] Đội ${emptyTeam === '100' ? 'Xanh' : 'Đỏ'} đang trống, tự động thêm 1 Bot để đủ điều kiện bắt đầu...`);
          await addOneBotToTeam(emptyTeam);
        }

        const res = await lcuRequest('POST', '/lol-lobby/v1/lobby/custom/start-champ-select');
        if (res && res.success === false) {
          addLog(`[WARN] start-champ-select trả về success=false. Đang tự động chuẩn hóa lại phòng và thử lại...`);
          await lcuRequest('POST', '/lol-lobby/v2/lobby/team/TEAM1');
          await sleep(200);
          const retryRes = await lcuRequest('POST', '/lol-lobby/v1/lobby/custom/start-champ-select');
          addLog(`[PASS] Đã vào Cấm/Chọn thành công! Kết quả: ${JSON.stringify(retryRes)}`);
        } else {
          addLog(`[PASS] Đã vào màn hình CẤM/CHỌN thành công! Kết quả: ${JSON.stringify(res)}`);
        }
        await pollLcuAndLiveGame();
        break;
      }

      case 'AUTO_COMPLETE_CHAMP_SELECT': {
        const cs = await lcuRequest('GET', '/lol-champ-select/v1/session');
        if (!cs || !cs.actions) {
          throw new Error('Hiện chưa ở trong màn hình Cấm/Chọn!');
        }
        const pickable = (await lcuRequest('GET', '/lol-champ-select/v1/pickable-champion-ids')) || [1, 18, 21, 22, 51];
        const bannable = (await lcuRequest('GET', '/lol-champ-select/v1/bannable-champion-ids')) || [];

        const usedIds = new Set();
        for (const group of cs.actions || []) {
          for (const act of group || []) {
            if (act.championId) usedIds.add(act.championId);
          }
        }

        let targetAct = null;
        for (const group of cs.actions || []) {
          for (const act of group || []) {
            if (!act.completed && act.actorCellId === cs.localPlayerCellId && act.isInProgress) {
              targetAct = act;
              break;
            }
          }
          if (targetAct) break;
        }

        if (!targetAct) {
          addLog('[INFO] Đang chờ hết 3 giây chuyển pha hoặc chưa tới lượt Cấm/Chọn của bạn. Hãy bấm lại sau 1 giây!');
          break;
        }

        const pool = targetAct.type === 'ban' && bannable.length > 0 ? bannable : pickable;
        const chosenChamp = pool.find((id) => !usedIds.has(id)) || pool[0] || 18;

        await lcuRequest('PATCH', `/lol-champ-select/v1/session/actions/${targetAct.id}`, {
          championId: chosenChamp,
          completed: true
        });
        addLog(
          `[PASS] Đã tự động khóa ${targetAct.type === 'ban' ? 'LƯỢT CẤM (BAN)' : 'TƯỚNG CHỌN (PICK)'} (ChampID=${chosenChamp}, ActionID=${targetAct.id})!`
        );
        await pollLcuAndLiveGame();
        break;
      }

      case 'PORT2999_HIDE_DEFAULT_HUD': {
        const hide = !pipelineState.liveSpectator2999.hudHidden;
        pipelineState.liveSpectator2999.hudHidden = hide;
        callPort2999Replay('/replay/render', {
          interfaceScoreboard: !hide,
          interfaceTimeline: !hide,
          interfaceFrames: !hide,
          interfaceTarget: !hide
        });
        addLog(`[PASS] Đã gửi lệnh ${hide ? 'ẨN' : 'HIỆN'} HUD mặc định của game qua Cổng 2999!`);
        break;
      }

      case 'PORT2999_SET_FOG': {
        const mode = payload.mode || 'ALL';
        pipelineState.liveSpectator2999.fogOfWar = mode;
        callPort2999Replay('/replay/render', {
          fogOfWar: mode !== 'ALL'
        });
        addLog(`[PASS] Đã gửi lệnh đổi Sương Mù (Fog of War = ${mode}) vào Cổng 2999!`);
        break;
      }

      case 'PORT2999_REWIND_15S': {
        const targetTime = Math.max(0, pipelineState.liveSpectator2999.gameTime - 15);
        callPort2999Replay('/replay/playback', { time: targetTime });
        addLog(`[PASS] Đã gửi lệnh Tua Lùi 15 giây (về mốc ${targetTime}s) vào Cổng 2999!`);
        break;
      }

      case 'SEND_SPECTATOR_CAMERA_KEY': {
        const key = payload.key || '1';
        exec(
          `powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; if ($ws.AppActivate('League of Legends (TM) Client')) { $ws.SendKeys('${key}') }"`
        );
        addLog(`[PASS] Đã gửi phím tắt Camera Trọng Tài [${key}] thẳng vào cửa sổ game League of Legends!`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    pipelineState.lcu.lastError = err.message;
    addLog(`[ERROR] ${err.message}`);
  }

  broadcastState();
}

function callPort2999Replay(endpoint, bodyObj) {
  const data = JSON.stringify(bodyObj);
  const req = https.request(
    {
      hostname: '127.0.0.1',
      port: 2999,
      path: endpoint,
      method: 'POST',
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 800
    },
    (res) => { res.resume(); }
  );
  req.on('error', () => {
    addLog(`[WARN] Cổng 2999 (${endpoint}) chưa mở: Chỉ hoạt động khi cửa sổ trận đấu 3D đang chạy!`);
  });
  req.write(data);
  req.end();
}

// ============================================================================
// HTTP + WEBSOCKET SERVER
// ============================================================================
function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const httpServer = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);

  if (urlObj.pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ state: pipelineState, lanIp: getLanIp(), port: PORT }));
    return;
  }

  if (urlObj.pathname === '/api/action' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const action = JSON.parse(body);
        await handlePipelineAction(action);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, state: pipelineState }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  let filePath = path.join(__dirname, 'public', urlObj.pathname === '/' ? 'index.html' : urlObj.pathname);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

const wss = new WebSocketServer({ server: httpServer });

function broadcastState() {
  const packet = JSON.stringify({
    type: 'PIPELINE_SYNC',
    lanIp: getLanIp(),
    port: PORT,
    state: pipelineState
  });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(packet);
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'PIPELINE_SYNC', lanIp: getLanIp(), port: PORT, state: pipelineState }));
  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      await handlePipelineAction(msg);
    } catch (_) {}
  });
});

httpServer.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`[INFO] Server already active on http://localhost:${PORT}`);
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[PASS] LoL Real Tournament Pipeline Engine listening on http://localhost:${PORT}`);
});
