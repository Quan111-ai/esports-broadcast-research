"""
verification/models.py

Normalized Data Models and Schemas for Esports Tournament Livestream Application.
Supports MOBA, Tactical Shooter, and Battle Royale genres across all match stages.
"""

from __future__ import annotations
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import List, Dict, Any, Optional, Set, Union
import uuid
import time


class GameGenre(str, Enum):
    MOBA = "MOBA"
    TACTICAL_SHOOTER = "TACTICAL_SHOOTER"
    BATTLE_ROYALE = "BATTLE_ROYALE"


class SupportedGameId(str, Enum):
    GAME_LOL = "GAME_LOL"
    GAME_VALORANT = "GAME_VALORANT"
    GAME_AOV = "GAME_AOV"             # Lien Quan Mobile
    GAME_WILDRIFT = "GAME_WILDRIFT"   # Toc Chien
    GAME_FREEFIRE = "GAME_FREEFIRE"   # Free Fire 12 Teams


class GamePhase(str, Enum):
    LOBBY = "LOBBY"
    PRE_MATCH = "PRE_MATCH"
    BAN_PICK = "BAN_PICK"
    LOADING = "LOADING"
    IN_GAME = "IN_GAME"
    TECH_PAUSE = "TECH_PAUSE"
    POST_MATCH = "POST_MATCH"
    SERIES_ENDED = "SERIES_ENDED"


class SpikeState(str, Enum):
    IDLE = "IDLE"
    CARRIED = "CARRIED"
    PLANTED = "PLANTED"
    DEFUSING = "DEFUSING"
    DETONATED = "DETONATED"
    DEFUSED = "DEFUSED"


def normalize_game_id(val: Any) -> SupportedGameId:
    """Case-insensitive normalizer for game IDs with OCR typo resilience."""
    if isinstance(val, SupportedGameId):
        return val
    if not val:
        return SupportedGameId.GAME_LOL
    s = str(val).strip().upper().replace("-", "_")
    s_clean = s.replace("0", "O")
    for item in SupportedGameId:
        if s == item.value or s_clean == item.value:
            return item
    if "LOL" in s_clean or "LEAGUE" in s_clean:
        return SupportedGameId.GAME_LOL
    if "VAL" in s_clean:
        return SupportedGameId.GAME_VALORANT
    if "AOV" in s_clean or "LIEN" in s_clean:
        return SupportedGameId.GAME_AOV
    if "WILD" in s_clean or "TOC" in s_clean:
        return SupportedGameId.GAME_WILDRIFT
    if "FREE" in s_clean or "FIRE" in s_clean or s_clean == "FF":
        return SupportedGameId.GAME_FREEFIRE
    return SupportedGameId.GAME_LOL


def normalize_game_genre(val: Any) -> GameGenre:
    """Case-insensitive normalizer for game genres."""
    if isinstance(val, GameGenre):
        return val
    if not val:
        return GameGenre.MOBA
    s = str(val).strip().upper().replace("-", "_")
    for item in GameGenre:
        if s == item.value:
            return item
    if "MOBA" in s:
        return GameGenre.MOBA
    if "SHOOT" in s or "TACTIC" in s or "FPS" in s or "VAL" in s:
        return GameGenre.TACTICAL_SHOOTER
    if "BATTLE" in s or "ROYALE" in s or "BR" in s or "FIRE" in s:
        return GameGenre.BATTLE_ROYALE
    return GameGenre.MOBA


def normalize_game_phase(val: Any) -> GamePhase:
    """Case-insensitive normalizer for match phases with OCR typo resilience."""
    if isinstance(val, GamePhase):
        return val
    if not val:
        return GamePhase.IN_GAME
    s = str(val).strip().upper().replace("-", "_")
    for item in GamePhase:
        if s == item.value:
            return item
    if "LOBBY" in s:
        return GamePhase.LOBBY
    if "PRE" in s:
        return GamePhase.PRE_MATCH
    if "BAN" in s or "PICK" in s or "DRAFT" in s:
        return GamePhase.BAN_PICK
    if "LOAD" in s:
        return GamePhase.LOADING
    if "IN_GAME" in s or "INGAME" in s or "LIVE" in s or "COMBAT" in s:
        return GamePhase.IN_GAME
    if "PAUSE" in s:
        return GamePhase.TECH_PAUSE
    if "POST" in s or "LEADERBOARD" in s:
        return GamePhase.POST_MATCH
    if "END" in s or "FINISH" in s:
        return GamePhase.SERIES_ENDED
    return GamePhase.IN_GAME


def normalize_spike_state(val: Any) -> SpikeState:
    """Case-insensitive normalizer for spike states."""
    if isinstance(val, SpikeState):
        return val
    if not val:
        return SpikeState.IDLE
    s = str(val).strip().upper().replace("-", "_")
    for item in SpikeState:
        if s == item.value:
            return item
    return SpikeState.IDLE


class BroadcastScene(str, Enum):
    SCENE_WAITING = "SCENE_WAITING"           # Scene 1: Waiting / Countdown / Intro
    SCENE_BAN_PICK = "SCENE_BAN_PICK"         # Scene 2: Ban / Pick Draft Stage
    SCENE_IN_GAME = "SCENE_IN_GAME"           # Scene 3: In-Game Live HUD
    SCENE_REPLAY = "SCENE_REPLAY"             # Scene 4: Replay / Highlight Callout
    SCENE_LEADERBOARD = "SCENE_LEADERBOARD"   # Scene 5: Leaderboard / 12-Team Summary
    SCENE_WINNER_MVP = "SCENE_WINNER_MVP"     # Scene 6: Winner Ceremony & MVP
    SCENE_TECH_PAUSE = "SCENE_TECH_PAUSE"     # Emergency 1-Second Technical Pause


class BracketFormat(str, Enum):
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION"
    DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION"
    ROUND_ROBIN = "ROUND_ROBIN"
    BATTLE_ROYALE_POINTS = "BATTLE_ROYALE_POINTS"


@dataclass
class PlayerState:
    player_id: str
    slot_index: int
    gamertag: str
    real_name: str = ""
    avatar_url: str = ""
    character_id: str = ""
    character_name: str = ""
    character_avatar_url: str = ""
    is_alive: bool = True
    respawn_timer_seconds: int = 0
    health_current: int = 100
    health_max: int = 100
    level: int = 1
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    net_worth: int = 0
    ultimate_ready: bool = False
    ultimate_charge_pct: float = 0.0
    items: List[str] = field(default_factory=list)
    is_picking: bool = False
    is_locked: bool = False
    pick_order: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> PlayerState:
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


@dataclass
class TeamState:
    team_id: str
    side: str  # BLUE, RED, ATTACKER, DEFENDER, or TEAM_01..TEAM_12
    name: str
    short_code: str
    logo_url: str = ""
    color_hex: str = "#FFFFFF"
    score: int = 0
    kills: int = 0
    deaths: int = 0
    total_gold_or_economy: int = 0
    roster: List[PlayerState] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TeamState:
        data_copy = dict(data)
        if "roster" in data_copy and isinstance(data_copy["roster"], list):
            data_copy["roster"] = [
                p if isinstance(p, PlayerState) else PlayerState.from_dict(p)
                for p in data_copy["roster"]
            ]
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class MobaPayload:
    game_time_seconds: int = 0
    blue_team: TeamState = field(default_factory=lambda: TeamState("team_blue", "BLUE", "Team Blue", "BLU"))
    red_team: TeamState = field(default_factory=lambda: TeamState("team_red", "RED", "Team Red", "RED"))
    blue_towers_destroyed: int = 0
    red_towers_destroyed: int = 0
    blue_dragons_killed: int = 0
    red_dragons_killed: int = 0
    blue_barons_killed: int = 0
    red_barons_killed: int = 0
    blue_inhibitors_destroyed: int = 0
    red_inhibitors_destroyed: int = 0
    blue_bans: List[str] = field(default_factory=list)
    red_bans: List[str] = field(default_factory=list)
    gold_difference: int = 0  # Blue total gold - Red total gold
    active_objective: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> MobaPayload:
        data_copy = dict(data)
        if "blue_team" in data_copy:
            if isinstance(data_copy["blue_team"], dict):
                data_copy["blue_team"] = TeamState.from_dict(data_copy["blue_team"])
            elif data_copy["blue_team"] is None:
                data_copy["blue_team"] = TeamState("team_blue", "BLUE", "Team Blue", "BLU")
        if "red_team" in data_copy:
            if isinstance(data_copy["red_team"], dict):
                data_copy["red_team"] = TeamState.from_dict(data_copy["red_team"])
            elif data_copy["red_team"] is None:
                data_copy["red_team"] = TeamState("team_red", "RED", "Team Red", "RED")
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class TacticalShooterPayload:
    current_round: int = 1
    round_time_remaining_ms: int = 100000
    round_phase: str = "COMBAT"  # BUY, COMBAT, POST_ROUND
    attacking_team: TeamState = field(default_factory=lambda: TeamState("atk", "ATTACKER", "Attackers", "ATK"))
    defending_team: TeamState = field(default_factory=lambda: TeamState("def", "DEFENDER", "Defenders", "DEF"))
    spike_state: SpikeState = SpikeState.IDLE
    spike_carrier_player_id: Optional[str] = None
    spike_defuser_player_id: Optional[str] = None
    plant_site: Optional[str] = None  # A, B, or C
    defuse_progress_pct: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if isinstance(self.spike_state, SpikeState):
            res["spike_state"] = self.spike_state.value
        return res

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TacticalShooterPayload:
        data_copy = dict(data)
        if "attacking_team" in data_copy:
            if isinstance(data_copy["attacking_team"], dict):
                data_copy["attacking_team"] = TeamState.from_dict(data_copy["attacking_team"])
            elif data_copy["attacking_team"] is None:
                data_copy["attacking_team"] = TeamState("atk", "ATTACKER", "Attackers", "ATK")
        if "defending_team" in data_copy:
            if isinstance(data_copy["defending_team"], dict):
                data_copy["defending_team"] = TeamState.from_dict(data_copy["defending_team"])
            elif data_copy["defending_team"] is None:
                data_copy["defending_team"] = TeamState("def", "DEFENDER", "Defenders", "DEF")
        if "spike_state" in data_copy:
            data_copy["spike_state"] = normalize_spike_state(data_copy["spike_state"])
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class BRTeamSummary:
    team_id: str
    slot_number: int  # 1 to 12
    team_name: str
    team_short_code: str
    logo_url: str = ""
    alive_players_count: int = 4
    is_eliminated: bool = False
    elimination_rank: Optional[int] = None  # 1 to 12
    elimination_time_seconds: Optional[int] = None
    match_kills: int = 0
    placement_points: int = 0
    kill_points: int = 0
    total_match_points: int = 0
    players: List[PlayerState] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> BRTeamSummary:
        data_copy = dict(data)
        if "players" in data_copy and isinstance(data_copy["players"], list):
            data_copy["players"] = [
                p if isinstance(p, PlayerState) else PlayerState.from_dict(p)
                for p in data_copy["players"]
            ]
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class BattleRoyalePayload:
    match_index: int = 1
    alive_teams_count: int = 12
    alive_players_count: int = 48
    zone_phase: int = 1
    teams: List[BRTeamSummary] = field(default_factory=list)
    recent_elimination: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> BattleRoyalePayload:
        data_copy = dict(data)
        if "teams" in data_copy and isinstance(data_copy["teams"], list):
            data_copy["teams"] = [
                t if isinstance(t, BRTeamSummary) else BRTeamSummary.from_dict(t)
                for t in data_copy["teams"]
            ]
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class TelemetryMetadata:
    is_manual_locked: bool = False
    locked_fields: Set[str] = field(default_factory=set)
    source: str = "auto_telemetry"
    operator_notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        res["locked_fields"] = list(self.locked_fields)
        return res

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TelemetryMetadata:
        data_copy = dict(data)
        if "locked_fields" in data_copy and isinstance(data_copy["locked_fields"], list):
            data_copy["locked_fields"] = set(data_copy["locked_fields"])
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class MatchTelemetryEvent:
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sequence_id: int = 0
    timestamp_utc: str = field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    timestamp_game_ms: int = 0
    game_id: SupportedGameId = SupportedGameId.GAME_LOL
    game_genre: GameGenre = GameGenre.MOBA
    match_id: str = "MATCH_001"
    game_number: int = 1
    phase: GamePhase = GamePhase.IN_GAME
    is_paused: bool = False
    payload: Union[MobaPayload, TacticalShooterPayload, BattleRoyalePayload] = field(default_factory=MobaPayload)
    metadata: TelemetryMetadata = field(default_factory=TelemetryMetadata)

    def to_dict(self) -> Dict[str, Any]:
        res = {
            "event_id": self.event_id,
            "sequence_id": self.sequence_id,
            "timestamp_utc": self.timestamp_utc,
            "timestamp_game_ms": self.timestamp_game_ms,
            "game_id": self.game_id.value if isinstance(self.game_id, SupportedGameId) else self.game_id,
            "game_genre": self.game_genre.value if isinstance(self.game_genre, GameGenre) else self.game_genre,
            "match_id": self.match_id,
            "game_number": self.game_number,
            "phase": self.phase.value if isinstance(self.phase, GamePhase) else self.phase,
            "is_paused": self.is_paused,
            "payload": self.payload.to_dict() if hasattr(self.payload, "to_dict") else asdict(self.payload),
            "metadata": self.metadata.to_dict() if hasattr(self.metadata, "to_dict") else asdict(self.metadata),
        }
        return res

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> MatchTelemetryEvent:
        data_copy = dict(data)
        game_id = normalize_game_id(data_copy.get("game_id", SupportedGameId.GAME_LOL.value))
        game_genre = normalize_game_genre(data_copy.get("game_genre", GameGenre.MOBA.value))
        phase = normalize_game_phase(data_copy.get("phase", GamePhase.IN_GAME.value))
        raw_payload = data_copy.get("payload", {})
        
        if raw_payload is None:
            payload = None
        elif game_genre == GameGenre.MOBA:
            payload = MobaPayload.from_dict(raw_payload) if isinstance(raw_payload, dict) else raw_payload
        elif game_genre == GameGenre.TACTICAL_SHOOTER:
            payload = TacticalShooterPayload.from_dict(raw_payload) if isinstance(raw_payload, dict) else raw_payload
        elif game_genre == GameGenre.BATTLE_ROYALE:
            payload = BattleRoyalePayload.from_dict(raw_payload) if isinstance(raw_payload, dict) else raw_payload
        else:
            payload = raw_payload

        raw_meta = data_copy.get("metadata", {})
        metadata = TelemetryMetadata.from_dict(raw_meta) if isinstance(raw_meta, dict) else raw_meta

        return cls(
            event_id=str(data_copy.get("event_id", "") or uuid.uuid4()),
            sequence_id=data_copy.get("sequence_id", 0),
            timestamp_utc=data_copy.get("timestamp_utc", ""),
            timestamp_game_ms=data_copy.get("timestamp_game_ms", 0),
            game_id=game_id,
            game_genre=game_genre,
            match_id=data_copy.get("match_id", ""),
            game_number=data_copy.get("game_number", 1),
            phase=phase,
            is_paused=data_copy.get("is_paused", False),
            payload=payload,
            metadata=metadata,
        )


@dataclass
class TournamentTeam:
    team_id: str
    name: str
    short_code: str
    logo_url: str = ""
    theme_color_primary: str = "#000000"
    theme_color_secondary: str = "#FFFFFF"
    seed: int = 1
    roster: List[PlayerState] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TournamentTeam:
        data_copy = dict(data)
        if "roster" in data_copy and isinstance(data_copy["roster"], list):
            data_copy["roster"] = [
                p if isinstance(p, PlayerState) else PlayerState.from_dict(p)
                for p in data_copy["roster"]
            ]
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class BracketNode:
    match_id: str
    round_name: str
    stage: str = "UPPER"  # UPPER, LOWER, GRAND_FINAL
    team_a: Optional[TournamentTeam] = None
    team_b: Optional[TournamentTeam] = None
    score_a: int = 0
    score_b: int = 0
    bo_format: int = 3  # BO1, BO3, BO5
    winner: Optional[TournamentTeam] = None
    loser: Optional[TournamentTeam] = None
    is_complete: bool = False
    next_match_id: Optional[str] = None
    next_slot: str = "A"  # A or B in next match
    loser_next_match_id: Optional[str] = None
    loser_next_slot: str = "A"
    bracket_reset: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> BracketNode:
        data_copy = dict(data)
        if "team_a" in data_copy and isinstance(data_copy["team_a"], dict):
            data_copy["team_a"] = TournamentTeam.from_dict(data_copy["team_a"])
        if "team_b" in data_copy and isinstance(data_copy["team_b"], dict):
            data_copy["team_b"] = TournamentTeam.from_dict(data_copy["team_b"])
        if "winner" in data_copy and isinstance(data_copy["winner"], dict):
            data_copy["winner"] = TournamentTeam.from_dict(data_copy["winner"])
        if "loser" in data_copy and isinstance(data_copy["loser"], dict):
            data_copy["loser"] = TournamentTeam.from_dict(data_copy["loser"])
        return cls(**{k: v for k, v in data_copy.items() if k in cls.__dataclass_fields__})


@dataclass
class Tournament:
    tournament_id: str
    name: str
    game_id: SupportedGameId
    format: BracketFormat
    teams: List[TournamentTeam] = field(default_factory=list)
    nodes: Dict[str, BracketNode] = field(default_factory=dict)
    current_match_id: Optional[str] = None
    enable_bracket_reset: bool = True
    champion: Optional[TournamentTeam] = None

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if isinstance(self.game_id, SupportedGameId):
            res["game_id"] = self.game_id.value
        if isinstance(self.format, BracketFormat):
            res["format"] = self.format.value
        return res


@dataclass
class SceneState:
    active_scene: BroadcastScene
    previous_scene: Optional[BroadcastScene] = None
    transition_effect: str = "crossfade_500ms"
    is_tech_paused: bool = False
    pause_message: str = ""
    canvas_16_9: Dict[str, Any] = field(default_factory=dict)
    canvas_9_16: Dict[str, Any] = field(default_factory=dict)
    last_updated_ms: int = field(default_factory=lambda: int(time.time() * 1000))

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if isinstance(self.active_scene, BroadcastScene):
            res["active_scene"] = self.active_scene.value
        if self.previous_scene and isinstance(self.previous_scene, BroadcastScene):
            res["previous_scene"] = self.previous_scene.value
        return res
