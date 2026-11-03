/**
 * LOL REAL TOURNAMENT PIPELINE & SPECTATOR ENGINE (PC NATIVE)
 * Connects 100% to the real League of Legends installation on this PC:
 *   - Path detected: E:\Riot Games\League of Legends
 *   - Step 1: Patch game.cfg (EnableReplayApi=1) & Connect to LCU (lockfile / LeagueClientUx.exe)
 *   - Step 2: Create Real Custom Tournament Lobby (POST /lol-lobby/v2/lobby), Switch to Spectator, Add Bots / Invite Players, Start Match
 *   - Step 3: Stream Real-Time Champ Select Session (GET /lol-champ-select/v1/session)
 *   - Step 4: Connect to Live Spectator Game (https://127.0.0.1:2999/liveclientdata/allgamedata & /replay/render)
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

const pipelineState = {
  installDir: detectLolInstallDir(),
  replayApiEnabledInCfg: false,
  lcu: {
    connected: false,
    port: null,
    password: null,
    protocol: 'https',
    summoner: null,
    gameflowPhase: 'None', // 'None' | 'Lobby' | 'ChampSelect' | 'InProgress' | 'WaitingForStats' | 'EndOfGame'
    lastError: null
  },
  lobby: {
    active: false,
    lobbyName: 'GIAI DAU LOL - BO3 VAN 1',
    lobbyPassword: '123',
    gameMode: 'CLASSIC',
    mapId: 11,
    mutatorId: 6, // 6 = Tournament Draft (Đấu Giải), 1 = Blind Pick (Chọn Ẩn), 2 = Draft Pick
    spectatorPolicy: 'AllAllowed',
    teamOne: [],
    teamTwo: [],
    spectators: [],
    rawLobby: null
  },
  champSelect: {
    active: false,
    timerPhase: '',
    timeLeftSec: 0,
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
  pipelineState.logs = pipelineState.logs.slice(0, 40);
  if (typeof wss !== 'undefined' && wss) {
    broadcastState();
  }
}

// ============================================================================
// STEP 1: CHECK / ENABLE EnableReplayApi=1 IN game.cfg & DETECT LCU LOCKFILE
// ============================================================================
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

function detectLcuFromProcess() {
  return new Promise((resolve) => {
    const lock = readLockfileSync();
    if (lock) return resolve(lock);

    exec(
      'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name=\'LeagueClientUx.exe\'\\" | Select-Object -ExpandProperty CommandLine"',
      { timeout: 1500 },
      (err, stdout) => {
        if (err || !stdout) return resolve(null);
        const portMatch = stdout.match(/--app-port=([0-9]+)/);
        const tokenMatch = stdout.match(/--remoting-auth-token=([\w_-]+)/);
        if (portMatch && tokenMatch) {
          return resolve({
            installDir: pipelineState.installDir,
            port: Number(portMatch[1]),
            password: tokenMatch[1],
            protocol: 'https'
          });
        }
        resolve(null);
      }
    );
  });
}

// Generic LCU HTTP Request helper
function lcuRequest(method, endpoint, bodyObj = null) {
  return new Promise((resolve, reject) => {
    if (!pipelineState.lcu.connected || !pipelineState.lcu.port) {
      return reject(new Error('Chưa kết nối được Sảnh Liên Minh Huyền Thoại (LCU). Hãy bật LoL trước!'));
    }

    const auth = Buffer.from(`riot:${pipelineState.lcu.password}`).toString('base64');
    const payload = bodyObj ? JSON.stringify(bodyObj) : null;

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
          ...(payload
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
              }
            : {})
        },
        timeout: 1500
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
            reject(new Error(`LCU HTTP ${res.statusCode}: ${typeof parsed === 'object' && parsed && parsed.message ? parsed.message : data}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

// ============================================================================
// STEP 2 & 3: POLL LCU STATE (SUMMONER, GAMEFLOW, LOBBY, CHAMP SELECT)
// ============================================================================
async function pollLcuAndLiveGame() {
  const creds = await detectLcuFromProcess();
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

    // If in Lobby, read custom lobby members & spectators
    if (pipelineState.lcu.gameflowPhase === 'Lobby') {
      try {
        const lob = await lcuRequest('GET', '/lol-lobby/v2/lobby');
        if (lob && lob.gameConfig) {
          pipelineState.lobby.active = true;
          pipelineState.lobby.teamOne = (lob.gameConfig.customTeam100 || []).map((m) => ({
            summonerName: m.summonerName || m.gameName || (m.botId ? `Bot (${m.botChampionId})` : 'Người chơi'),
            isBot: Boolean(m.isBot),
            summonerId: m.summonerId
          }));
          pipelineState.lobby.teamTwo = (lob.gameConfig.customTeam200 || []).map((m) => ({
            summonerName: m.summonerName || m.gameName || (m.botId ? `Bot (${m.botChampionId})` : 'Người chơi'),
            isBot: Boolean(m.isBot),
            summonerId: m.summonerId
          }));
          pipelineState.lobby.spectators = (lob.gameConfig.customSpectators || []).map((m) => ({
            summonerName: m.summonerName || m.gameName || 'Trọng tài',
            summonerId: m.summonerId
          }));
        }
      } catch (_) {
        pipelineState.lobby.active = false;
      }
    } else {
      pipelineState.lobby.active = false;
    }

    // If in ChampSelect, read real-time Ban/Pick session
    if (pipelineState.lcu.gameflowPhase === 'ChampSelect') {
      try {
        const cs = await lcuRequest('GET', '/lol-champ-select/v1/session');
        if (cs) {
          pipelineState.champSelect.active = true;
          pipelineState.champSelect.timerPhase = cs.timer ? cs.timer.phase : '';
          pipelineState.champSelect.timeLeftSec = cs.timer ? Math.max(0, Math.floor((cs.timer.adjustedTimeLeftInPhase || 0) / 1000)) : 0;
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

  // Step 4: Poll Port 2999 Live Client Data API (Spectator / Active Game)
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
            addLog('[PASS] Đã kết nối Cổng 2999 (Live Client Data API) trong trận đấu thật!');
          }
          pipelineState.liveSpectator2999.connected = true;
          pipelineState.liveSpectator2999.gameTime = data.gameData ? Math.floor(data.gameData.gameTime || 0) : 0;
          pipelineState.liveSpectator2999.gameMode = data.gameData ? data.gameData.gameMode : '';
          pipelineState.liveSpectator2999.mapName = data.gameData ? data.gameData.mapName : '';
          pipelineState.liveSpectator2999.allPlayers = (data.allPlayers || []).map((p) => ({
            summonerName: p.summonerName || p.riotIdGameName || p.championName,
            championName: p.championName,
            team: p.team, // 'ORDER' (Blue) | 'CHAOS' (Red)
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

setInterval(pollLcuAndLiveGame, 1200);

// ============================================================================
// PIPELINE ACTIONS (CALLED FROM UI BUTTONS)
// ============================================================================
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
          addLog(`[PASS] Đang khởi động ${leagueClientExe}... Đợi sảnh LoL mở để bắt lockfile.`);
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
        const lobbyPassword = payload.lobbyPassword || pipelineState.lobby.lobbyPassword;
        const mutatorId = Number(payload.mutatorId || pipelineState.lobby.mutatorId || 6);
        pipelineState.lobby.lobbyName = lobbyName;
        pipelineState.lobby.lobbyPassword = lobbyPassword;
        pipelineState.lobby.mutatorId = mutatorId;

        const body = {
          customGameLobby: {
            configuration: {
              gameMode: 'CLASSIC',
              gameMutator: '',
              gameServerRegion: '',
              mapId: 11,
              mutators: { id: mutatorId }, // 6 = Tournament Draft (Đấu Giải), 1 = Blind Pick (Chọn Ẩn), 2 = Draft Pick
              spectatorPolicy: 'AllAllowed',
              teamSize: 5
            },
            lobbyName,
            lobbyPassword
          },
          isCustom: true
        };

        await lcuRequest('POST', '/lol-lobby/v2/lobby', body);
        addLog(`[PASS] Đã tạo Phòng Giải Đấu "${lobbyName}" (Chế độ ID=${mutatorId}) ngay trong Sảnh LoL!`);
        await pollLcuAndLiveGame();
        break;
      }

      case 'SWITCH_TO_SPECTATOR': {
        await lcuRequest('POST', '/lol-lobby/v1/custom-games/switch-to-spectator');
        addLog('[PASS] Đã chuyển nick của bạn xuống Hàng Trọng Tài / Khán Giả (Spectator)!');
        await pollLcuAndLiveGame();
        break;
      }

      case 'SWITCH_TO_PLAYER': {
        const teamId = payload.teamId || 100; // 100 = Blue, 200 = Red
        await lcuRequest('POST', `/lol-lobby/v1/custom-games/switch-to-team?team=${teamId}`);
        addLog(`[PASS] Đã chuyển nick của bạn lên Đội ${teamId === 100 ? 'Xanh (100)' : 'Đỏ (200)'}!`);
        await pollLcuAndLiveGame();
        break;
      }

      case 'ADD_TEST_BOTS': {
        // Add bots to Team 100 & Team 200 so user can immediately test starting a custom match and spectating!
        const botChamps = [24, 64, 103, 222, 412]; // Jax, LeeSin, Ahri, Jinx, Thresh
        const teamId = String(payload.teamId || '100');
        const champId = botChamps[Math.floor(Math.random() * botChamps.length)];
        await lcuRequest('POST', '/lol-lobby/v1/custom-games/bots', {
          botDifficulty: 'MEDIUM',
          championId: champId,
          teamId
        });
        addLog(`[PASS] Đã thêm Bot (ChampID=${champId}) vào Đội ${teamId === '100' ? 'Xanh (100)' : 'Đỏ (200)'}!`);
        await pollLcuAndLiveGame();
        break;
      }

      case 'START_CHAMP_SELECT': {
        await lcuRequest('POST', '/lol-lobby/v1/custom-games/start-champ-select');
        addLog('[PASS] Đã gửi lệnh Bắt Đầu Trận Đấu (Start Champ Select) vào Sảnh LoL!');
        await pollLcuAndLiveGame();
        break;
      }

      case 'CREATE_PRACTICE_TOOL_LOBBY': {
        const body = {
          customGameLobby: {
            configuration: {
              gameMode: 'PRACTICETOOL',
              gameMutator: '',
              gameServerRegion: '',
              mapId: 11,
              mutators: { id: 1 },
              spectatorPolicy: 'AllAllowed',
              teamSize: 5
            },
            lobbyName: 'TEST CONG 2999 TRUC TIEP',
            lobbyPassword: ''
          },
          isCustom: true
        };
        await lcuRequest('POST', '/lol-lobby/v2/lobby', body);
        addLog('[PASS] Đã tạo phòng Phòng Tập (Practice Tool) để test vào trận 0 giây chờ!');
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
        addLog(`[PASS] Đã gửi lệnh ${hide ? 'ẨN' : 'HIỆN'} giao diện mặc định của game qua Cổng 2999 (/replay/render)!`);
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
        addLog(`[PASS] Đã gửi lệnh Tua Lùi 15 giây (về mốc ${targetTime}s) vào Cổng 2999 (/replay/playback)!`);
        break;
      }

      case 'SEND_SPECTATOR_CAMERA_KEY': {
        const key = payload.key || '1';
        // Send hotkey directly to League of Legends window via PowerShell WScript.Shell
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
  req.on('error', (err) => {
    addLog(`[WARN] Cổng 2999 (${endpoint}) chưa phản hồi: Hãy chắc chắn đang ở trong trận đấu!`);
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
