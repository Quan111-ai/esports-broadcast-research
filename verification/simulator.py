"""
verification/simulator.py

Real-Time Telemetry Generator Simulating Data Streams for 5 Major Esports Games:
1. League of Legends (LoL - PC MOBA)
2. VALORANT (PC Tactical Shooter)
3. Lien Quan Mobile (Arena of Valor - Mobile MOBA)
4. LoL: Wild Rift (Mobile MOBA)
5. Free Fire (12-Team Battle Royale)

Covers all 4 Match Phases:
- LOBBY / PRE_MATCH
- BAN_PICK
- IN_GAME
- POST_MATCH
"""

from __future__ import annotations
import copy
import time
import uuid
from typing import List, Dict, Any, Generator, Optional
from verification.models import (
    MatchTelemetryEvent,
    SupportedGameId,
    GameGenre,
    GamePhase,
    MobaPayload,
    TacticalShooterPayload,
    BattleRoyalePayload,
    BRTeamSummary,
    TeamState,
    PlayerState,
    SpikeState,
    TelemetryMetadata,
)


class EsportsSimulator:
    """
    Simulates high-fidelity telemetry feeds for all 5 supported games.
    """

    def __init__(self):
        self.seq_counter = 0

    def _next_seq(self) -> int:
        self.seq_counter += 1
        return self.seq_counter

    def _create_moba_roster(self, team_prefix: str, role_names: List[str], char_names: List[str]) -> List[PlayerState]:
        roster = []
        for idx, (role, char) in enumerate(zip(role_names, char_names)):
            p = PlayerState(
                player_id=f"{team_prefix}_P{idx+1}",
                slot_index=idx,
                gamertag=f"{team_prefix}_{role}",
                real_name=f"Player {idx+1}",
                character_id=f"CHAR_{char.upper()}",
                character_name=char,
                is_alive=True,
                health_current=1000 + idx * 100,
                health_max=1000 + idx * 100,
                level=1,
                kills=0,
                deaths=0,
                assists=0,
                net_worth=500,
                ultimate_ready=False,
                ultimate_charge_pct=0.0,
                items=["Doran's Blade" if idx == 3 else "Starting Item"],
            )
            roster.append(p)
        return roster

    def simulate_lol_match(self, match_id: str = "LOL_M1", game_number: int = 1) -> List[MatchTelemetryEvent]:
        """
        Simulate a full League of Legends match stream:
        1. PRE_MATCH (Lobby)
        2. BAN_PICK (Draft with 6 bans, 10 picks)
        3. IN_GAME (Game clock 00:00 to 24:15, first blood, drag, baron, towers, gold lead)
        4. POST_MATCH (Blue Nexus destroyed, Red Victory)
        """
        events: List[MatchTelemetryEvent] = []
        roles = ["TOP", "JGL", "MID", "BOT", "SUP"]
        blue_chars = ["Aatrox", "Sejuani", "Azir", "Jinx", "Thresh"]
        red_chars = ["Fiora", "LeeSin", "Ahri", "Aphelios", "Nautilus"]

        blue_team = TeamState(
            team_id="T_BLUE_T1",
            side="BLUE",
            name="T1 Esports",
            short_code="T1",
            logo_url="/assets/t1_logo.png",
            color_hex="#E4002B",
            score=0,
            kills=0,
            deaths=0,
            roster=self._create_moba_roster("T1", roles, blue_chars),
        )
        red_team = TeamState(
            team_id="T_RED_GEN",
            side="RED",
            name="Gen.G",
            short_code="GEN",
            logo_url="/assets/geng_logo.png",
            color_hex="#AA8A00",
            score=0,
            kills=0,
            deaths=0,
            roster=self._create_moba_roster("GEN", roles, red_chars),
        )

        # 1. PRE_MATCH Event
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_LOL,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.PRE_MATCH,
            payload=MobaPayload(
                game_time_seconds=0,
                blue_team=copy.deepcopy(blue_team),
                red_team=copy.deepcopy(red_team),
            ),
        ))

        # 2. BAN_PICK Event
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_LOL,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.BAN_PICK,
            payload=MobaPayload(
                game_time_seconds=0,
                blue_team=copy.deepcopy(blue_team),
                red_team=copy.deepcopy(red_team),
                blue_bans=["K'Sante", "Orianna", "Vi"],
                red_bans=["Jayce", "Kalista", "Varus"],
            ),
        ))

        # 3. IN_GAME Events: Early, Mid, Late
        # 3a. Game Start (03:25 - First Blood for Blue)
        blue_team.kills = 1
        red_team.deaths = 1
        blue_team.roster[2].kills = 1  # Faker mid kill
        blue_team.total_gold_or_economy = 5200
        red_team.total_gold_or_economy = 4800
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_LOL,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                game_time_seconds=205,
                blue_team=copy.deepcopy(blue_team),
                red_team=copy.deepcopy(red_team),
                gold_difference=400,
                active_objective="First Blood",
            ),
        ))

        # 3b. Mid Game (15:40 - Dragons & Towers)
        blue_team.kills = 7
        red_team.kills = 4
        blue_team.total_gold_or_economy = 28500
        red_team.total_gold_or_economy = 25200
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_LOL,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                game_time_seconds=940,
                blue_team=copy.deepcopy(blue_team),
                red_team=copy.deepcopy(red_team),
                blue_towers_destroyed=3,
                red_towers_destroyed=1,
                blue_dragons_killed=2,
                red_dragons_killed=0,
                gold_difference=3300,
                active_objective="Dragon Soul Point",
            ),
        ))

        # 3c. Late Game (24:15 - Baron fight & Nexus push)
        blue_team.kills = 18
        red_team.kills = 9
        blue_team.score = 1  # Wins Game 1
        blue_team.total_gold_or_economy = 51200
        red_team.total_gold_or_economy = 41000
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_LOL,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.POST_MATCH,
            payload=MobaPayload(
                game_time_seconds=1455,
                blue_team=copy.deepcopy(blue_team),
                red_team=copy.deepcopy(red_team),
                blue_towers_destroyed=9,
                red_towers_destroyed=2,
                blue_dragons_killed=3,
                red_dragons_killed=1,
                blue_barons_killed=1,
                red_barons_killed=0,
                blue_inhibitors_destroyed=2,
                gold_difference=10200,
                active_objective="Nexus Destroyed",
            ),
        ))

        return events

    def simulate_valorant_match(self, match_id: str = "VAL_M1", game_number: int = 1) -> List[MatchTelemetryEvent]:
        """
        Simulate a VALORANT match stream:
        1. Agent Select (Draft)
        2. In-Game Round 1 (Pistol round, Spike plant, defuse)
        3. In-Game Round 12 (Halftime switch)
        4. In-Game Round 24 (Match point)
        5. Match End (13-11 score)
        """
        events: List[MatchTelemetryEvent] = []
        atk_agents = ["Jett", "Omen", "Sova", "Killjoy", "Fade"]
        def_agents = ["Raze", "Astra", "Breach", "Cypher", "Viper"]

        atk_team = TeamState(
            team_id="T_FNC",
            side="ATTACKER",
            name="Fnatic",
            short_code="FNC",
            logo_url="/assets/fnc.png",
            color_hex="#FF5900",
            score=0,
            kills=0,
            roster=[
                PlayerState(f"FNC_{i+1}", i, f"FNC_P{i+1}", character_name=agent, health_current=100)
                for i, agent in enumerate(atk_agents)
            ],
        )
        def_team = TeamState(
            team_id="T_PRX",
            side="DEFENDER",
            name="Paper Rex",
            short_code="PRX",
            logo_url="/assets/prx.png",
            color_hex="#003399",
            score=0,
            kills=0,
            roster=[
                PlayerState(f"PRX_{i+1}", i, f"PRX_P{i+1}", character_name=agent, health_current=100)
                for i, agent in enumerate(def_agents)
            ],
        )

        # 1. Agent Select
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_VALORANT,
            game_genre=GameGenre.TACTICAL_SHOOTER,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.BAN_PICK,
            payload=TacticalShooterPayload(
                current_round=1,
                round_phase="BUY",
                attacking_team=copy.deepcopy(atk_team),
                defending_team=copy.deepcopy(def_team),
            ),
        ))

        # 2. Round 1: Spike Planted at A site
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_VALORANT,
            game_genre=GameGenre.TACTICAL_SHOOTER,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.IN_GAME,
            payload=TacticalShooterPayload(
                current_round=1,
                round_time_remaining_ms=35000,
                round_phase="COMBAT",
                attacking_team=copy.deepcopy(atk_team),
                defending_team=copy.deepcopy(def_team),
                spike_state=SpikeState.PLANTED,
                plant_site="A",
                defuse_progress_pct=0.0,
            ),
        ))

        # 3. Round 1: Defused by Defenders -> Score 0 - 1
        def_team.score = 1
        def_team.kills = 5
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_VALORANT,
            game_genre=GameGenre.TACTICAL_SHOOTER,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.IN_GAME,
            payload=TacticalShooterPayload(
                current_round=1,
                round_time_remaining_ms=0,
                round_phase="POST_ROUND",
                attacking_team=copy.deepcopy(atk_team),
                defending_team=copy.deepcopy(def_team),
                spike_state=SpikeState.DEFUSED,
                plant_site="A",
                defuse_progress_pct=100.0,
            ),
        ))

        # 4. Final Round 24 -> Fnatic reaches 13 wins
        atk_team.score = 13
        def_team.score = 11
        atk_team.kills = 82
        def_team.kills = 76
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_VALORANT,
            game_genre=GameGenre.TACTICAL_SHOOTER,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.POST_MATCH,
            payload=TacticalShooterPayload(
                current_round=24,
                round_time_remaining_ms=0,
                round_phase="POST_ROUND",
                attacking_team=copy.deepcopy(atk_team),
                defending_team=copy.deepcopy(def_team),
                spike_state=SpikeState.DETONATED,
            ),
        ))

        return events

    def simulate_lien_quan_match(self, match_id: str = "AOV_M1", game_number: int = 1) -> List[MatchTelemetryEvent]:
        """
        Simulate Arena of Valor (Lien Quan Mobile) match:
        Saigon Phantom (SGP) vs Team Flash (FL).
        """
        events: List[MatchTelemetryEvent] = []
        roles = ["DS", "JUG", "MID", "AD", "SUP"]
        sgp_chars = ["Ryoma", "Nakroth", "Krixi", "Elsu", "Thane"]
        fl_chars = ["Florentino", "Aoi", "Tulen", "Violet", "Helen"]

        sgp = TeamState(
            team_id="T_SGP",
            side="BLUE",
            name="Saigon Phantom",
            short_code="SGP",
            logo_url="/assets/sgp.png",
            color_hex="#E2B714",
            score=0,
            kills=0,
            deaths=0,
            roster=self._create_moba_roster("SGP", roles, sgp_chars),
        )
        fl = TeamState(
            team_id="T_FL",
            side="RED",
            name="Team Flash",
            short_code="FL",
            logo_url="/assets/fl.png",
            color_hex="#FF6600",
            score=0,
            kills=0,
            deaths=0,
            roster=self._create_moba_roster("FL", roles, fl_chars),
        )

        # 1. Draft
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_AOV,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.BAN_PICK,
            payload=MobaPayload(
                game_time_seconds=0,
                blue_team=copy.deepcopy(sgp),
                red_team=copy.deepcopy(fl),
                blue_bans=["Richter", "Keera"],
                red_bans=["Rouie", "Billow"],
            ),
        ))

        # 2. In Game (Dark Slayer Caesar fight at 12:40)
        sgp.kills = 12
        fl.kills = 9
        sgp.total_gold_or_economy = 34500
        fl.total_gold_or_economy = 32100
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_AOV,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                game_time_seconds=760,
                blue_team=copy.deepcopy(sgp),
                red_team=copy.deepcopy(fl),
                blue_towers_destroyed=4,
                red_towers_destroyed=2,
                blue_dragons_killed=2,
                gold_difference=2400,
                active_objective="Dark Slayer Caesar Defeated",
            ),
        ))

        # 3. Post Match (Victory for SGP)
        sgp.kills = 17
        fl.kills = 10
        sgp.score = 1
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_AOV,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.POST_MATCH,
            payload=MobaPayload(
                game_time_seconds=980,
                blue_team=copy.deepcopy(sgp),
                red_team=copy.deepcopy(fl),
                blue_towers_destroyed=9,
                red_towers_destroyed=3,
                gold_difference=8500,
                active_objective="Core Destroyed - SGP Victory",
            ),
        ))

        return events

    def simulate_wild_rift_match(self, match_id: str = "WR_M1", game_number: int = 1) -> List[MatchTelemetryEvent]:
        """
        Simulate LoL: Wild Rift mobile match.
        """
        events: List[MatchTelemetryEvent] = []
        team_a = TeamState("T_CER", "BLUE", "Cerberus Esports", "CES", logo_url="/assets/ces.png")
        team_b = TeamState("T_GAM", "RED", "GAM Esports", "GAM", logo_url="/assets/gam.png")

        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_WILDRIFT,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                game_time_seconds=600,
                blue_team=copy.deepcopy(team_a),
                red_team=copy.deepcopy(team_b),
                blue_towers_destroyed=2,
                gold_difference=1500,
            ),
        ))
        team_a.score = 1
        team_a.kills = 15
        team_b.kills = 8
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_WILDRIFT,
            game_genre=GameGenre.MOBA,
            match_id=match_id,
            game_number=game_number,
            phase=GamePhase.POST_MATCH,
            payload=MobaPayload(
                game_time_seconds=1150,
                blue_team=copy.deepcopy(team_a),
                red_team=copy.deepcopy(team_b),
                blue_towers_destroyed=7,
                gold_difference=6200,
            ),
        ))
        return events

    def simulate_free_fire_match(
        self,
        match_index: int = 1,
        team_names: Optional[List[str]] = None,
    ) -> List[MatchTelemetryEvent]:
        """
        Simulate Free Fire 12-team Battle Royale match:
        - 12 teams (48 players)
        - In-Game zone progressions and eliminations
        - Post-Match 12-team leaderboard extraction (ranks 1 to 12)
        """
        events: List[MatchTelemetryEvent] = []
        default_names = [
            "WAG Esports", "V-Gaming", "Team Flash", "Heavy Esports",
            "GOW", "HQ Esports", "God of Wolf", "Buriram United",
            "EVOS Phoenix", "Attack All Around", "Magic School", "EXP Esports",
        ]
        names = team_names or default_names

        br_teams: List[BRTeamSummary] = []
        for i, name in enumerate(names[:12], start=1):
            short = "".join(w[0] for w in name.split())[:3].upper()
            br_teams.append(BRTeamSummary(
                team_id=f"FF_TEAM_{i:02d}",
                slot_number=i,
                team_name=name,
                team_short_code=short,
                alive_players_count=4,
                is_eliminated=False,
                match_kills=0,
            ))

        # 1. Lobby / In-game start (Bo 1, 12 teams alive)
        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_FREEFIRE,
            game_genre=GameGenre.BATTLE_ROYALE,
            match_id=f"FF_MATCH_{match_index}",
            game_number=match_index,
            phase=GamePhase.IN_GAME,
            payload=BattleRoyalePayload(
                match_index=match_index,
                alive_teams_count=12,
                alive_players_count=48,
                zone_phase=1,
                teams=copy.deepcopy(br_teams),
            ),
        ))

        # 2. Mid Game (Bo 4, 6 teams left)
        eliminated_order = [11, 10, 9, 8, 7, 6]  # indices
        for rank_pos, t_idx in enumerate(eliminated_order, start=7):
            br_teams[t_idx].is_eliminated = True
            br_teams[t_idx].alive_players_count = 0
            br_teams[t_idx].elimination_rank = 13 - (t_idx - 5)
            br_teams[t_idx].match_kills = (t_idx % 3)

        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_FREEFIRE,
            game_genre=GameGenre.BATTLE_ROYALE,
            match_id=f"FF_MATCH_{match_index}",
            game_number=match_index,
            phase=GamePhase.IN_GAME,
            payload=BattleRoyalePayload(
                match_index=match_index,
                alive_teams_count=6,
                alive_players_count=18,
                zone_phase=4,
                teams=copy.deepcopy(br_teams),
            ),
        ))

        # 3. Post-Match (Full 12-team leaderboard OCR extracted in 2.0s)
        placements_and_kills = [
            (1, 9), (2, 6), (3, 5), (4, 4),
            (5, 3), (6, 2), (7, 4), (8, 1),
            (9, 2), (10, 0), (11, 2), (12, 1),
        ]
        from verification.tournament_engine import FREE_FIRE_PLACEMENT_POINTS

        for idx, (rank, kills) in enumerate(placements_and_kills):
            team = br_teams[idx]
            team.elimination_rank = rank
            team.match_kills = kills
            team.placement_points = FREE_FIRE_PLACEMENT_POINTS.get(rank, 0)
            team.kill_points = kills
            team.total_match_points = team.placement_points + team.kill_points
            team.is_eliminated = (rank > 1)
            team.alive_players_count = 4 if rank == 1 else 0

        events.append(MatchTelemetryEvent(
            event_id=str(uuid.uuid4()),
            sequence_id=self._next_seq(),
            game_id=SupportedGameId.GAME_FREEFIRE,
            game_genre=GameGenre.BATTLE_ROYALE,
            match_id=f"FF_MATCH_{match_index}",
            game_number=match_index,
            phase=GamePhase.POST_MATCH,
            payload=BattleRoyalePayload(
                match_index=match_index,
                alive_teams_count=1,
                alive_players_count=4,
                zone_phase=6,
                teams=copy.deepcopy(br_teams),
            ),
        ))

        return events
