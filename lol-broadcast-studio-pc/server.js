/**
 * LOL BROADCAST STUDIO PC - ULTRA-LIGHTWEIGHT CORE ENGINE
 * Official Riot Local APIs:
 *   1. LCU API (lockfile -> https://127.0.0.1:{port}/lol-champ-select/v1/session)
 *   2. Live Client Data API (https://127.0.0.1:2999/liveclientdata/allgamedata)
 *   3. Replay / Spectator Director API (https://127.0.0.1:2999/replay/render & /replay/playback)
 *   4. Riot Data Dragon CDN (https://ddragon.leagueoflegends.com/cdn/14.24.1)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 3080);
const DDRAGON_VER = '14.24.1';
const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VER}`;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Helper for Riot Data Dragon URLs (Cloned from RCVolus/lol-pick-ban-ui DataDragon.ts)
function champAssets(id, key) {
  return {
    id,
    key,
    name: id === 'KSante' ? "K'Sante" : id === 'Kaisa' ? "Kai'Sa" : id === 'LeeSin' ? 'Lee Sin' : id,
    squareImg: `${DDRAGON_BASE}/img/champion/${id}.png`,
    loadingImg: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`,
    splashImg: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`
  };
}

function spellIcon(spellId) {
  return `${DDRAGON_BASE}/img/spell/${spellId}.png`;
}

function itemIcon(itemId) {
  return `${DDRAGON_BASE}/img/item/${itemId}.png`;
}

const CHAMP_POOL = [
  champAssets('Jax', 24),
  champAssets('LeeSin', 64),
  champAssets('Ahri', 103),
  champAssets('Jinx', 222),
  champAssets('Thresh', 412),
  champAssets('KSante', 897),
  champAssets('Vi', 254),
  champAssets('Azir', 268),
  champAssets('Kaisa', 145),
  champAssets('Nautilus', 111),
  champAssets('Yone', 777),
  champAssets('Skarner', 72),
  champAssets('Rumble', 68),
  champAssets('Sylas', 517),
  champAssets('Kalista', 429),
  champAssets('Renata', 888),
  champAssets('Maokai', 57),
  champAssets('Orianna', 61),
  champAssets('Leblanc', 7),
  champAssets('Rell', 526),
  champAssets('Aatrox', 266),
  champAssets('Sejuani', 113),
  champAssets('Syndra', 134),
  champAssets('Varus', 110),
  champAssets('Rakan', 497)
];

// Full 20-step Tournament Draft Sequence (6 Bans Phase 1 -> 6 Picks Phase 1 -> 4 Bans Phase 2 -> 4 Picks Phase 2)
const DRAFT_SCRIPT = [
  { type: 'BAN', team: 'BLUE', slot: 0, champ: CHAMP_POOL[10] }, // Yone
  { type: 'BAN', team: 'RED', slot: 0, champ: CHAMP_POOL[11] },  // Skarner
  { type: 'BAN', team: 'BLUE', slot: 1, champ: CHAMP_POOL[12] }, // Rumble
  { type: 'BAN', team: 'RED', slot: 1, champ: CHAMP_POOL[13] },  // Sylas
  { type: 'BAN', team: 'BLUE', slot: 2, champ: CHAMP_POOL[14] }, // Kalista
  { type: 'BAN', team: 'RED', slot: 2, champ: CHAMP_POOL[15] },  // Renata
  { type: 'PICK', team: 'BLUE', slot: 0, champ: CHAMP_POOL[0] }, // Jax (Top)
  { type: 'PICK', team: 'RED', slot: 0, champ: CHAMP_POOL[5] },  // K'Sante (Top)
  { type: 'PICK', team: 'RED', slot: 1, champ: CHAMP_POOL[6] },  // Vi (Jungle)
  { type: 'PICK', team: 'BLUE', slot: 1, champ: CHAMP_POOL[1] }, // LeeSin (Jungle)
  { type: 'PICK', team: 'BLUE', slot: 2, champ: CHAMP_POOL[2] }, // Ahri (Mid)
  { type: 'PICK', team: 'RED', slot: 2, champ: CHAMP_POOL[7] },  // Azir (Mid)
  { type: 'BAN', team: 'RED', slot: 3, champ: CHAMP_POOL[16] },  // Maokai
  { type: 'BAN', team: 'BLUE', slot: 3, champ: CHAMP_POOL[17] }, // Orianna
  { type: 'BAN', team: 'RED', slot: 4, champ: CHAMP_POOL[18] },  // Leblanc
  { type: 'BAN', team: 'BLUE', slot: 4, champ: CHAMP_POOL[19] }, // Rell
  { type: 'PICK', team: 'RED', slot: 3, champ: CHAMP_POOL[8] },  // Kai'Sa (ADC)
  { type: 'PICK', team: 'BLUE', slot: 3, champ: CHAMP_POOL[3] }, // Jinx (ADC)
  { type: 'PICK', team: 'BLUE', slot: 4, champ: CHAMP_POOL[4] }, // Thresh (Support)
  { type: 'PICK', team: 'RED', slot: 4, champ: CHAMP_POOL[9] }   // Nautilus (Support)
];

function createInitialState() {
  return {
    meta: {
      tournamentName: 'LCK SPLIT BROADCAST STUDIO 2026',
      seriesFormat: 'BO5',
      gameNumber: 2,
      patch: DDRAGON_VER,
      connectionMode: 'SIMULATOR_READY', // 'LCU_LIVE' | 'PORT_2999_LIVE' | 'SIMULATOR_READY'
      lcuConnected: false,
      live2999Connected: false,
      fearlessDraftEnabled: true,
      fearlessLockedChampions: [
        CHAMP_POOL[20], // Aatrox (Game 1)
        CHAMP_POOL[21], // Sejuani (Game 1)
        CHAMP_POOL[22], // Syndra (Game 1)
        CHAMP_POOL[23], // Varus (Game 1)
        CHAMP_POOL[24]  // Rakan (Game 1)
      ]
    },
    // Current Broadcast Scene controlled from Director Deck:
    // 'DRAFT' | 'VS_LOADING' | 'INGAME' | 'POSTGAME'
    scene: 'INGAME',
    director: {
      selectedPositionId: 'BLUE_MID', // 'BLUE_TOP'..'BLUE_SUP', 'RED_TOP'..'RED_SUP'
      selectedRole: 'MID',            // 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT'
      cameraHotkey: '3',
      aiAutoDirector: true,
      fogOfWar: 'ALL',                // 'ALL' | 'BLUE' | 'RED'
      bottomPanelMode: 'MATCHUP_1V1', // 'TABLE_10' | 'MATCHUP_1V1' | 'GOLD_GRAPH'
      replayActive: false,
      replayCountdown: 0,
      technicalPause: false,
      crop916Target: { x: 52, y: 48, label: 'Khu vực Đường Giữa (Mid River)' }
    },
    draft: {
      stepIndex: 20,
      phaseLabel: 'FINALPHASE - CHUẨN BỊ VÀO TRẬN',
      timer: 24,
      activeTeam: 'BLUE',
      blueBans: [CHAMP_POOL[10], CHAMP_POOL[12], CHAMP_POOL[14], CHAMP_POOL[17], CHAMP_POOL[19]],
      redBans: [CHAMP_POOL[11], CHAMP_POOL[13], CHAMP_POOL[15], CHAMP_POOL[16], CHAMP_POOL[18]]
    },
    inGame: {
      gameTimeSeconds: 1485, // 24:45
      baronPowerPlay: {
        active: true,
        team: 'BLUE',
        remainingSeconds: 118,
        goldSwing: +2840
      },
      nextDragon: { type: 'Hextech (Công Nghệ)', spawnInSeconds: 42 },
      goldHistory: [
        { min: 5, diff: 300 },
        { min: 10, diff: 1250 },
        { min: 15, diff: -400 },
        { min: 20, diff: 2100 },
        { min: 24, diff: 4600 }
      ],
      aiCombatAlert: {
        active: true,
        role: 'MID',
        targetId: 'BLUE_MID',
        zoneName: 'Hang Baron / Bờ Sông Đường Giữa',
        reason: 'Phát hiện 4 tướng tụ tập + Tụt máu nhanh (-38% HP)',
        confidence: 96
      },
      killFeed: [
        { id: 1, time: '24:32', killer: 'T1 Faker (Ahri)', victim: 'GEN Chovy (Azir)', badge: 'SHUTDOWN +700G', team: 'BLUE' },
        { id: 2, time: '23:50', killer: 'T1 Oner (Lee Sin)', victim: 'Baron Nashor', badge: 'BARON SECURED', team: 'BLUE' }
      ]
    },
    blueTeam: {
      code: 'T1',
      name: 'T1 ESPORTS',
      coach: 'kkOma',
      score: 1,
      kills: 16,
      gold: 48900,
      towers: 7,
      dragons: ['Infernal', 'Ocean', 'Hextech'],
      barons: 1,
      voidgrubs: 4,
      players: [
        {
          id: 'BLUE_TOP',
          role: 'TOP',
          hotkey: '1',
          name: 'T1 Zeus',
          champion: CHAMP_POOL[0], // Jax
          level: 15,
          kills: 3,
          deaths: 2,
          assists: 7,
          cs: 234,
          gold: 10250,
          damageDealt: 21400,
          hpPercent: 86,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerTeleport')],
          items: [itemIcon(3078), itemIcon(3053), itemIcon(6610), itemIcon(3111), itemIcon(3026), itemIcon(3340)],
          mapPos: { x: 26, y: 24 }
        },
        {
          id: 'BLUE_JUNGLE',
          role: 'JUNGLE',
          hotkey: '2',
          name: 'T1 Oner',
          champion: CHAMP_POOL[1], // Lee Sin
          level: 14,
          kills: 4,
          deaths: 1,
          assists: 10,
          cs: 168,
          gold: 9400,
          damageDealt: 16800,
          hpPercent: 92,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerSmite')],
          items: [itemIcon(6692), itemIcon(3071), itemIcon(3047), itemIcon(3156), itemIcon(1031), itemIcon(3364)],
          mapPos: { x: 35, y: 32 }
        },
        {
          id: 'BLUE_MID',
          role: 'MID',
          hotkey: '3',
          name: 'T1 Faker',
          champion: CHAMP_POOL[2], // Ahri
          level: 16,
          kills: 6,
          deaths: 0,
          assists: 8,
          cs: 258,
          gold: 11850,
          damageDealt: 29600,
          hpPercent: 74,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerTeleport')],
          items: [itemIcon(6655), itemIcon(4645), itemIcon(3089), itemIcon(3157), itemIcon(3020), itemIcon(3363)],
          mapPos: { x: 48, y: 46 }
        },
        {
          id: 'BLUE_ADC',
          role: 'ADC',
          hotkey: '4',
          name: 'T1 Gumayusi',
          champion: CHAMP_POOL[3], // Jinx
          level: 15,
          kills: 3,
          deaths: 1,
          assists: 9,
          cs: 272,
          gold: 11300,
          damageDealt: 27900,
          hpPercent: 95,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerBarrier')],
          items: [itemIcon(3031), itemIcon(3085), itemIcon(3036), itemIcon(3006), itemIcon(3072), itemIcon(3363)],
          mapPos: { x: 54, y: 52 }
        },
        {
          id: 'BLUE_SUPPORT',
          role: 'SUPPORT',
          hotkey: '5',
          name: 'T1 Keria',
          champion: CHAMP_POOL[4], // Thresh
          level: 12,
          kills: 0,
          deaths: 2,
          assists: 14,
          cs: 38,
          gold: 6100,
          damageDealt: 6200,
          hpPercent: 80,
          ultReady: false,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerDot')],
          items: [itemIcon(3190), itemIcon(3109), itemIcon(3117), itemIcon(2055), itemIcon(1028), itemIcon(3364)],
          mapPos: { x: 51, y: 49 }
        }
      ]
    },
    redTeam: {
      code: 'GEN',
      name: 'GEN.G ESPORTS',
      coach: 'KIM',
      score: 0,
      kills: 6,
      gold: 44300,
      towers: 3,
      dragons: ['Mountain'],
      barons: 0,
      voidgrubs: 2,
      players: [
        {
          id: 'RED_TOP',
          role: 'TOP',
          hotkey: 'Q',
          name: 'GEN Kiin',
          champion: CHAMP_POOL[5], // K'Sante
          level: 14,
          kills: 1,
          deaths: 3,
          assists: 3,
          cs: 219,
          gold: 9100,
          damageDealt: 17500,
          hpPercent: 68,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerTeleport')],
          items: [itemIcon(6662), itemIcon(3068), itemIcon(3047), itemIcon(3076), itemIcon(1054), itemIcon(3340)],
          mapPos: { x: 31, y: 27 }
        },
        {
          id: 'RED_JUNGLE',
          role: 'JUNGLE',
          hotkey: 'W',
          name: 'GEN Canyon',
          champion: CHAMP_POOL[6], // Vi
          level: 13,
          kills: 2,
          deaths: 4,
          assists: 3,
          cs: 154,
          gold: 8200,
          damageDealt: 13400,
          hpPercent: 61,
          ultReady: false,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerSmite')],
          items: [itemIcon(6610), itemIcon(3071), itemIcon(3111), itemIcon(3053), itemIcon(1036), itemIcon(3364)],
          mapPos: { x: 42, y: 36 }
        },
        {
          id: 'RED_MID',
          role: 'MID',
          hotkey: 'E',
          name: 'GEN Chovy',
          champion: CHAMP_POOL[7], // Azir
          level: 15,
          kills: 2,
          deaths: 3,
          assists: 3,
          cs: 264,
          gold: 10450,
          damageDealt: 24800,
          hpPercent: 45,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerTeleport')],
          items: [itemIcon(3115), itemIcon(4633), itemIcon(3157), itemIcon(3020), itemIcon(1058), itemIcon(3363)],
          mapPos: { x: 52, y: 44 }
        },
        {
          id: 'RED_ADC',
          role: 'ADC',
          hotkey: 'R',
          name: 'GEN Peyz',
          champion: CHAMP_POOL[8], // Kai'Sa
          level: 14,
          kills: 1,
          deaths: 3,
          assists: 4,
          cs: 251,
          gold: 10600,
          damageDealt: 22100,
          hpPercent: 88,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerHeal')],
          items: [itemIcon(3124), itemIcon(3087), itemIcon(3153), itemIcon(3006), itemIcon(1042), itemIcon(3363)],
          mapPos: { x: 58, y: 49 }
        },
        {
          id: 'RED_SUPPORT',
          role: 'SUPPORT',
          hotkey: 'T',
          name: 'GEN Lehends',
          champion: CHAMP_POOL[9], // Nautilus
          level: 11,
          kills: 0,
          deaths: 3,
          assists: 5,
          cs: 34,
          gold: 5950,
          damageDealt: 5400,
          hpPercent: 72,
          ultReady: true,
          respawnTimer: 0,
          spells: [spellIcon('SummonerFlash'), spellIcon('SummonerDot')],
          items: [itemIcon(3190), itemIcon(3050), itemIcon(3047), itemIcon(2055), itemIcon(1029), itemIcon(3364)],
          mapPos: { x: 55, y: 47 }
        }
      ]
    }
  };
}

let state = createInitialState();

// ============================================================================
// OFFICIAL RIOT API CONNECTORS (LCU lockfile + Port 2999 Live Client & Replay)
// ============================================================================
const DEFAULT_LOCKFILE_PATHS = [
  'C:\\Riot Games\\League of Legends\\lockfile',
  'D:\\Riot Games\\League of Legends\\lockfile',
  'E:\\Riot Games\\League of Legends\\lockfile'
];

function findLcuLockfile() {
  for (const p of DEFAULT_LOCKFILE_PATHS) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8').trim();
        const parts = raw.split(':');
        if (parts.length >= 5) {
          return { port: parts[2], password: parts[3], protocol: parts[4] };
        }
      } catch (_) {}
    }
  }
  return null;
}

function callReplayRenderApi(payload) {
  const data = JSON.stringify(payload);
  const req = https.request(
    {
      hostname: '127.0.0.1',
      port: 2999,
      path: '/replay/render',
      method: 'POST',
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 600
    },
    (res) => { res.resume(); }
  );
  req.on('error', () => {});
  req.write(data);
  req.end();
}

function callReplayPlaybackApi(payload) {
  const data = JSON.stringify(payload);
  const req = https.request(
    {
      hostname: '127.0.0.1',
      port: 2999,
      path: '/replay/playback',
      method: 'POST',
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 600
    },
    (res) => { res.resume(); }
  );
  req.on('error', () => {});
  req.write(data);
  req.end();
}

// Poll Port 2999 Live Client Data API if League of Legends Spectator is open
function pollLiveClient2999() {
  const req = https.get(
    {
      hostname: '127.0.0.1',
      port: 2999,
      path: '/liveclientdata/allgamedata',
      agent: httpsAgent,
      timeout: 500
    },
    (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return;
      }
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const live = JSON.parse(body);
          state.meta.live2999Connected = true;
          state.meta.connectionMode = 'PORT_2999_LIVE';
          if (live.gameData && typeof live.gameData.gameTime === 'number') {
            state.inGame.gameTimeSeconds = Math.floor(live.gameData.gameTime);
          }
          // Hide default Riot HUD clutter automatically on first connect
          callReplayRenderApi({
            interfaceScoreboard: false,
            interfaceTimeline: false,
            interfaceFrames: false,
            interfaceTarget: false
          });
          broadcastState();
        } catch (_) {}
      });
    }
  );
  req.on('error', () => {
    state.meta.live2999Connected = false;
    const lcu = findLcuLockfile();
    state.meta.lcuConnected = Boolean(lcu);
    state.meta.connectionMode = lcu ? 'LCU_LIVE' : 'SIMULATOR_READY';
  });
}

// ============================================================================
// DIRECTOR ACTION DISPATCHER (From PC Studio Deck or iPad Touch Remote)
// ============================================================================
function findPlayerById(positionId) {
  const all = [...state.blueTeam.players, ...state.redTeam.players];
  return all.find((p) => p.id === positionId) || state.blueTeam.players[2];
}

function handleDirectorAction(action) {
  const { type, payload } = action;

  switch (type) {
    case 'SET_SCENE': {
      state.scene = payload.scene;
      break;
    }
    case 'SELECT_POSITION': {
      const target = findPlayerById(payload.positionId);
      state.director.selectedPositionId = target.id;
      state.director.selectedRole = target.role;
      state.director.cameraHotkey = target.hotkey;
      state.director.crop916Target = {
        x: target.mapPos.x,
        y: target.mapPos.y,
        label: `Camera Trọng Tài -> ${target.name} (${target.champion.name} - ${target.role})`
      };
      break;
    }
    case 'TOGGLE_AI_DIRECTOR': {
      state.director.aiAutoDirector = !state.director.aiAutoDirector;
      break;
    }
    case 'SET_FOG_OF_WAR': {
      state.director.fogOfWar = payload.mode; // 'ALL' | 'BLUE' | 'RED'
      callReplayRenderApi({ fogOfWar: payload.mode !== 'ALL' });
      break;
    }
    case 'SET_BOTTOM_PANEL': {
      state.director.bottomPanelMode = payload.mode; // 'TABLE_10' | 'MATCHUP_1V1' | 'GOLD_GRAPH'
      break;
    }
    case 'TRIGGER_REPLAY_15S': {
      state.director.replayActive = true;
      state.director.replayCountdown = 15;
      callReplayPlaybackApi({ time: Math.max(0, state.inGame.gameTimeSeconds - 15) });
      break;
    }
    case 'TOGGLE_PAUSE': {
      state.director.technicalPause = !state.director.technicalPause;
      break;
    }
    case 'TOGGLE_FEARLESS': {
      state.meta.fearlessDraftEnabled = !state.meta.fearlessDraftEnabled;
      break;
    }
    case 'DRAFT_STEP_NEXT': {
      state.scene = 'DRAFT';
      if (state.draft.stepIndex >= DRAFT_SCRIPT.length) {
        state.draft.stepIndex = 0;
        state.draft.blueBans = [];
        state.draft.redBans = [];
      } else {
        state.draft.stepIndex += 1;
      }
      applyDraftScriptStep(state.draft.stepIndex);
      break;
    }
    case 'DRAFT_RESET': {
      state.scene = 'DRAFT';
      state.draft.stepIndex = 0;
      applyDraftScriptStep(0);
      break;
    }
    case 'SWAP_SIDES_NEXT_GAME': {
      // Lock all 10 current picks into Fearless Draft Pool & Swap Blue/Red sides
      if (state.meta.fearlessDraftEnabled) {
        const usedThisGame = [
          ...state.blueTeam.players.map((p) => p.champion),
          ...state.redTeam.players.map((p) => p.champion)
        ];
        const existingIds = new Set(state.meta.fearlessLockedChampions.map((c) => c.id));
        for (const ch of usedThisGame) {
          if (!existingIds.has(ch.id)) {
            state.meta.fearlessLockedChampions.push(ch);
            existingIds.add(ch.id);
          }
        }
      }
      state.meta.gameNumber += 1;
      if (payload && payload.winner === 'RED') {
        state.redTeam.score += 1;
      } else {
        state.blueTeam.score += 1;
      }
      // Swap team metadata
      const prevBlue = { code: state.blueTeam.code, name: state.blueTeam.name, coach: state.blueTeam.coach, score: state.blueTeam.score };
      state.blueTeam.code = state.redTeam.code;
      state.blueTeam.name = state.redTeam.name;
      state.blueTeam.coach = state.redTeam.coach;
      state.blueTeam.score = state.redTeam.score;
      state.redTeam.code = prevBlue.code;
      state.redTeam.name = prevBlue.name;
      state.redTeam.coach = prevBlue.coach;
      state.redTeam.score = prevBlue.score;
      state.scene = 'DRAFT';
      break;
    }
    case 'SIMULATE_TEAMFIGHT': {
      state.scene = 'INGAME';
      state.blueTeam.kills += 2;
      state.blueTeam.gold += 1450;
      state.blueTeam.players[2].kills += 2;
      state.blueTeam.players[2].gold += 900;
      state.redTeam.players[2].deaths += 1;
      state.redTeam.players[2].respawnTimer = 32;
      state.redTeam.players[1].deaths += 1;
      state.redTeam.players[1].respawnTimer = 28;
      state.inGame.killFeed.unshift({
        id: Date.now(),
        time: formatClock(state.inGame.gameTimeSeconds),
        killer: `${state.blueTeam.players[2].name} (${state.blueTeam.players[2].champion.name})`,
        victim: `${state.redTeam.players[2].name} (${state.redTeam.players[2].champion.name})`,
        badge: 'DOUBLE KILL + BARON FIGHT',
        team: 'BLUE'
      });
      state.inGame.killFeed = state.inGame.killFeed.slice(0, 4);
      if (state.director.aiAutoDirector) {
        state.director.selectedPositionId = 'BLUE_MID';
        state.director.selectedRole = 'MID';
        state.director.cameraHotkey = '3';
        state.director.bottomPanelMode = 'MATCHUP_1V1';
      }
      break;
    }
    case 'UPDATE_TEAMS': {
      if (payload.tournamentName) state.meta.tournamentName = payload.tournamentName;
      if (payload.seriesFormat) state.meta.seriesFormat = payload.seriesFormat;
      if (payload.blueCode) state.blueTeam.code = payload.blueCode;
      if (payload.blueName) state.blueTeam.name = payload.blueName;
      if (payload.redCode) state.redTeam.code = payload.redCode;
      if (payload.redName) state.redTeam.name = payload.redName;
      break;
    }
    default:
      break;
  }

  broadcastState();
}

function applyDraftScriptStep(stepCount) {
  state.draft.blueBans = [];
  state.draft.redBans = [];
  for (let i = 0; i < stepCount && i < DRAFT_SCRIPT.length; i++) {
    const s = DRAFT_SCRIPT[i];
    if (s.type === 'BAN') {
      if (s.team === 'BLUE') state.draft.blueBans.push(s.champ);
      else state.draft.redBans.push(s.champ);
    } else if (s.type === 'PICK') {
      if (s.team === 'BLUE') state.blueTeam.players[s.slot].champion = s.champ;
      else state.redTeam.players[s.slot].champion = s.champ;
    }
  }
  const nextAction = DRAFT_SCRIPT[Math.min(stepCount, DRAFT_SCRIPT.length - 1)];
  state.draft.activeTeam = nextAction ? nextAction.team : 'BLUE';
  state.draft.timer = 27;
  if (stepCount < 6) state.draft.phaseLabel = 'BAN PHASE 1 (CẤM ĐỢT 1)';
  else if (stepCount < 12) state.draft.phaseLabel = 'PICK PHASE 1 (CHỌN ĐỢT 1)';
  else if (stepCount < 16) state.draft.phaseLabel = 'BAN PHASE 2 (CẤM ĐỢT 2)';
  else if (stepCount < 20) state.draft.phaseLabel = 'PICK PHASE 2 (CHỌN ĐỢT 2)';
  else state.draft.phaseLabel = 'FINALPHASE - KHÓA ĐỘI HÌNH';
}

function formatClock(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Live 1-second tick for Simulator & Replay Timers
setInterval(() => {
  pollLiveClient2999();

  if (!state.director.technicalPause) {
    if (state.scene === 'DRAFT') {
      state.draft.timer = state.draft.timer > 0 ? state.draft.timer - 1 : 27;
    } else if (state.scene === 'INGAME') {
      if (!state.meta.live2999Connected) {
        state.inGame.gameTimeSeconds += 1;
        state.blueTeam.gold += 35;
        state.redTeam.gold += 28;
      }
      if (state.inGame.baronPowerPlay.active) {
        if (state.inGame.baronPowerPlay.remainingSeconds > 0) {
          state.inGame.baronPowerPlay.remainingSeconds -= 1;
          state.inGame.baronPowerPlay.goldSwing += 12;
        } else {
          state.inGame.baronPowerPlay.active = false;
        }
      }
      if (state.inGame.nextDragon.spawnInSeconds > 0) {
        state.inGame.nextDragon.spawnInSeconds -= 1;
      } else {
        state.inGame.nextDragon.spawnInSeconds = 300;
      }
      // Subtle minimap organic motion + respawn countdown
      const allPlayers = [...state.blueTeam.players, ...state.redTeam.players];
      for (const p of allPlayers) {
        if (p.respawnTimer > 0) p.respawnTimer -= 1;
        const jitterX = (Math.random() - 0.5) * 1.4;
        const jitterY = (Math.random() - 0.5) * 1.4;
        p.mapPos.x = Math.max(12, Math.min(88, Math.round((p.mapPos.x + jitterX) * 10) / 10));
        p.mapPos.y = Math.max(12, Math.min(88, Math.round((p.mapPos.y + jitterY) * 10) / 10));
      }
      // Rotate AI Minimap Combat Radar dynamically every 14s
      const roles = [
        { role: 'MID', id: 'BLUE_MID', zone: 'Hang Baron / Bờ Sông Đường Giữa' },
        { role: 'ADC', id: 'BLUE_ADC', zone: 'Khu vực Hang Rồng / Đường Dưới' },
        { role: 'TOP', id: 'BLUE_TOP', zone: 'Cánh Trên / Bờ Sông Baron' },
        { role: 'JUNGLE', id: 'BLUE_JUNGLE', zone: 'Rừng Bùa Đỏ Đối Phương' }
      ];
      const activeIdx = Math.floor(state.inGame.gameTimeSeconds / 14) % roles.length;
      const hotspot = roles[activeIdx];
      state.inGame.aiCombatAlert.role = hotspot.role;
      state.inGame.aiCombatAlert.targetId = hotspot.id;
      state.inGame.aiCombatAlert.zoneName = hotspot.zone;
    }
  }

  if (state.director.replayActive) {
    if (state.director.replayCountdown > 0) {
      state.director.replayCountdown -= 1;
    } else {
      state.director.replayActive = false;
    }
  }

  broadcastState();
}, 1000);

// ============================================================================
// HTTP + WEBSOCKET SERVER (Serves PC Desktop App, iPad Touch Remote & Overlays)
// ============================================================================
function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const httpServer = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);

  if (urlObj.pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ state, lanIp: getLanIp(), port: PORT }));
    return;
  }

  if (urlObj.pathname === '/api/action' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const action = JSON.parse(body);
        handleDirectorAction(action);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, state }));
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
    type: 'STATE_SYNC',
    lanIp: getLanIp(),
    port: PORT,
    state
  });
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(packet);
    }
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'STATE_SYNC', lanIp: getLanIp(), port: PORT, state }));
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      handleDirectorAction(msg);
    } catch (_) {}
  });
});

// Native PC Desktop Window Launcher (Uses Microsoft Edge WebView2 / Chrome --app frameless native window)
function launchNativePcWindow(url) {
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const bin of edgePaths) {
    if (fs.existsSync(bin)) {
      exec(`"${bin}" --app="${url}" --window-size=1640,960`);
      return true;
    }
  }
  exec(`start "" "${url}"`);
  return false;
}

httpServer.listen(PORT, '0.0.0.0', () => {
  const lanIp = getLanIp();
  console.log(`[PASS] LoL Broadcast Studio PC Engine running at:`);
  console.log(`       -> PC Studio App   : http://localhost:${PORT}`);
  console.log(`       -> iPad Remote LAN : http://${lanIp}:${PORT}/?view=director`);
  console.log(`       -> 16:9 Live Output: http://localhost:${PORT}/?view=overlay169`);
  console.log(`       -> 9:16 TikTok Live: http://localhost:${PORT}/?view=overlay916`);

  if (process.argv.includes('--open-pc-app')) {
    launchNativePcWindow(`http://localhost:${PORT}`);
  }
});
