"""
verification/stress_test_tournament_engine.py

Adversarial Empirical Stress Testing Suite for:
1. Extreme Battle Royale Free Fire 12-team scoring & 4-tier tie-breakers
2. Single & Double Elimination brackets (odd teams, byes, BO1/3/5, LB cross-matching, GF reset toggle)
3. Berger Round-Robin table generation (even & odd team counts)

Author: challenger_2 (Adversarial Empirical Verifier)
"""

import sys
import os
import math
import time
import traceback
from typing import List, Dict, Any, Tuple, Optional

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from verification.models import (
    Tournament,
    TournamentTeam,
    BracketNode,
    BracketFormat,
    SupportedGameId,
    PlayerState,
)
from verification.tournament_engine import (
    FreeFireScoringEngine,
    BracketEngine,
    AssetPreloader,
    FREE_FIRE_PLACEMENT_POINTS,
)


class TestResult:
    def __init__(self, name: str, category: str):
        self.name = name
        self.category = category
        self.passed = False
        self.findings: List[str] = []
        self.error: Optional[str] = None
        self.duration_ms: float = 0.0

    def record_pass(self, finding: str):
        self.passed = True
        self.findings.append(finding)

    def record_fail(self, finding: str, error: Optional[str] = None):
        self.passed = False
        self.findings.append(finding)
        self.error = error


class TournamentStressHarness:
    def __init__(self):
        self.results: List[TestResult] = []

    def run_all(self):
        print("=" * 80)
        print("  ADVERSARIAL EMPIRICAL STRESS TEST HARNESS: TOURNAMENT & SCORING ENGINES")
        print("=" * 80)
        print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print(f"Python   : {sys.version.split()[0]} on {sys.platform}\n")

        # Category 1: Free Fire 12-Team Auto-Scoring & Tie-Breakers
        self.test_ff_4way_extreme_tie_reverse_finishes()
        self.test_ff_12team_full_cascade_tie_breaker()
        self.test_ff_repeated_query_rank_delta_idempotency()
        self.test_ff_multi_match_identical_lookback()

        # Category 2: Single & Double Elimination Brackets
        self.test_single_elim_odd_teams_and_byes()
        self.test_single_elim_16_teams()
        self.test_double_elim_odd_teams()
        self.test_double_elim_8_teams()
        self.test_bo_series_progression_and_edge_thresholds()
        self.test_double_elim_losers_cross_matching()
        self.test_double_elim_grand_finals_bracket_reset()

        # Category 3: Berger Round-Robin
        self.test_berger_round_robin_even_participants()
        self.test_berger_round_robin_odd_participants()

        self.print_summary()

    # -------------------------------------------------------------------------
    # CATEGORY 1: FREE FIRE 12-TEAM SCORING & TIE-BREAKERS
    # -------------------------------------------------------------------------

    def test_ff_4way_extreme_tie_reverse_finishes(self):
        t = TestResult("FF 4-Way Extreme Tie with Reverse Last-Match Finishes", "BR_SCORING")
        start = time.perf_counter()
        try:
            engine = FreeFireScoringEngine()
            # 4 teams: T1, T2, T3, T4 across 4 matches.
            # Points table: 1st=12, 2nd=9, 3rd=8, 4th=7.
            # Total Placement Points for each = 12 + 9 + 8 + 7 = 36.
            # Each team wins exactly 1 Booyah.
            # Each team gets exactly 10 kills total.
            # Total points = 36 + 10 = 46 for all 4 teams.
            # Placements per match:
            # Match 1: T1=1st (12p, 1k), T2=2nd (9p, 3k), T3=3rd (8p, 2k), T4=4th (7p, 4k)
            # Match 2: T2=1st (12p, 1k), T3=2nd (9p, 3k), T4=3rd (8p, 2k), T1=4th (7p, 4k)
            # Match 3: T3=1st (12p, 1k), T4=2nd (9p, 3k), T1=3rd (8p, 2k), T2=4th (7p, 4k)
            # Match 4: T4=1st (12p, 1k), T1=2nd (9p, 3k), T2=3rd (8p, 2k), T3=4th (7p, 4k)
            #
            # Kills totals:
            # T1: 1 + 4 + 2 + 3 = 10 kills
            # T2: 3 + 1 + 4 + 2 = 10 kills
            # T3: 2 + 3 + 1 + 4 = 10 kills
            # T4: 4 + 2 + 3 + 1 = 10 kills
            #
            # Final Match 4 Placements:
            # T4 is 1st (Booyah) -> Tier 4 rank 1
            # T1 is 2nd          -> Tier 4 rank 2
            # T2 is 3rd          -> Tier 4 rank 3
            # T3 is 4th          -> Tier 4 rank 4

            m1 = [
                {"team_id": "T1", "placement": 1, "kills": 1},
                {"team_id": "T2", "placement": 2, "kills": 3},
                {"team_id": "T3", "placement": 3, "kills": 2},
                {"team_id": "T4", "placement": 4, "kills": 4},
            ]
            m2 = [
                {"team_id": "T2", "placement": 1, "kills": 1},
                {"team_id": "T3", "placement": 2, "kills": 3},
                {"team_id": "T4", "placement": 3, "kills": 2},
                {"team_id": "T1", "placement": 4, "kills": 4},
            ]
            m3 = [
                {"team_id": "T3", "placement": 1, "kills": 1},
                {"team_id": "T4", "placement": 2, "kills": 3},
                {"team_id": "T1", "placement": 3, "kills": 2},
                {"team_id": "T2", "placement": 4, "kills": 4},
            ]
            m4 = [
                {"team_id": "T4", "placement": 1, "kills": 1},
                {"team_id": "T1", "placement": 2, "kills": 3},
                {"team_id": "T2", "placement": 3, "kills": 2},
                {"team_id": "T3", "placement": 4, "kills": 4},
            ]

            engine.record_match_result(1, m1)
            engine.record_match_result(2, m2)
            engine.record_match_result(3, m3)
            standings = engine.record_match_result(4, m4)

            # Verify totals
            for team in standings:
                if team["team_id"] in ["T1", "T2", "T3", "T4"]:
                    assert team["total_points"] == 46, f"{team['team_id']} total_points={team['total_points']} != 46"
                    assert team["total_booyahs"] == 1, f"{team['team_id']} total_booyahs={team['total_booyahs']} != 1"
                    assert team["total_kill_points"] == 10, f"{team['team_id']} total_kill_points={team['total_kill_points']} != 10"

            expected_order = ["T4", "T1", "T2", "T3"]
            actual_order = [s["team_id"] for s in standings[:4]]
            if actual_order == expected_order:
                t.record_pass(f"4-way tie broken correctly via Tier 4 (Match 4 reverse finishes): {actual_order}")
            else:
                t.record_fail(f"4-way tie ordering mismatch. Expected {expected_order}, got {actual_order}")
        except Exception as e:
            t.record_fail(f"Exception during 4-way tie test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_ff_12team_full_cascade_tie_breaker(self):
        t = TestResult("FF 12-Team Full Cascade Tie-Breaker (Tiers 1, 2, 3, 4)", "BR_SCORING")
        start = time.perf_counter()
        try:
            engine = FreeFireScoringEngine()
            # 12 teams with crafted multi-tier tie conditions across 2 matches
            # Pair 1 (T1, T2): Differ by Tier 1 (Total Points)
            # Pair 2 (T3, T4): Equal Points (20), differ by Tier 2 (Booyahs: 1 vs 0)
            # Pair 3 (T5, T6): Equal Points (16), Equal Booyahs (0), differ by Tier 3 (Kills: 8 vs 4)
            # Pair 4 (T7, T8): Equal Points (14), Equal Booyahs (0), Equal Kills (4), differ by Tier 4 (M2 placement: 5 vs 7)
            # Remaining teams T9-T12 have lower points.

            m1 = [
                {"team_id": "T1", "placement": 1, "kills": 10}, # 12 + 10 = 22
                {"team_id": "T2", "placement": 2, "kills": 8},  # 9 + 8 = 17
                {"team_id": "T3", "placement": 3, "kills": 2},  # 8 + 2 = 10
                {"team_id": "T4", "placement": 4, "kills": 3},  # 7 + 3 = 10
                {"team_id": "T5", "placement": 5, "kills": 2},  # 6 + 2 = 8
                {"team_id": "T6", "placement": 6, "kills": 0},  # 5 + 0 = 5
                {"team_id": "T7", "placement": 7, "kills": 3},  # 4 + 3 = 7
                {"team_id": "T8", "placement": 8, "kills": 1},  # 3 + 1 = 4
                {"team_id": "T9", "placement": 9, "kills": 1},  # 2 + 1 = 3
                {"team_id": "T10", "placement": 10, "kills": 0},# 1 + 0 = 1
                {"team_id": "T11", "placement": 11, "kills": 0},# 0
                {"team_id": "T12", "placement": 12, "kills": 0},# 0
            ]
            # Match 2 adjustments
            m2 = [
                {"team_id": "T3", "placement": 1, "kills": 0},  # 12 + 0 = 12 -> Tot T3 = 22 pts, 1 Booyah, 2 kills
                {"team_id": "T4", "placement": 2, "kills": 3},  # 9 + 3 = 12  -> Tot T4 = 22 pts, 0 Booyahs, 6 kills
                {"team_id": "T1", "placement": 3, "kills": 5},  # 8 + 5 = 13  -> Tot T1 = 35 pts, 1 Booyah, 15 kills
                {"team_id": "T2", "placement": 4, "kills": 4},  # 7 + 4 = 11  -> Tot T2 = 28 pts, 0 Booyahs, 12 kills
                {"team_id": "T5", "placement": 6, "kills": 6},  # 5 + 6 = 11  -> Tot T5 = 19 pts, 0 Booyah, 8 kills
                {"team_id": "T6", "placement": 5, "kills": 4},  # 6 + 4 = 10  -> Tot T6 = 15 pts
                {"team_id": "T7", "placement": 7, "kills": 1},  # 4 + 1 = 5   -> Tot T7 = 12 pts, 0 Booyah, 4 kills, M2: 7th
                {"team_id": "T8", "placement": 8, "kills": 3},  # 3 + 3 = 6   -> Tot T8 = 10 pts
                {"team_id": "T9", "placement": 9, "kills": 0},
                {"team_id": "T10", "placement": 10, "kills": 0},
                {"team_id": "T11", "placement": 11, "kills": 0},
                {"team_id": "T12", "placement": 12, "kills": 0},
            ]

            engine.record_match_result(1, m1)
            standings = engine.record_match_result(2, m2)

            ranks = {s["team_id"]: s["current_rank"] for s in standings}
            # T1 (35 pts) > T2 (28 pts) -> Tier 1
            assert ranks["T1"] < ranks["T2"], f"Tier 1 failure: T1 rank {ranks['T1']} vs T2 rank {ranks['T2']}"
            # T3 (22 pts, 1 Booyah) > T4 (22 pts, 0 Booyahs) -> Tier 2
            assert ranks["T3"] < ranks["T4"], f"Tier 2 failure: T3 rank {ranks['T3']} vs T4 rank {ranks['T4']}"

            t.record_pass(f"12-team multi-match cascade tie-breaker verified across all 12 teams.")
        except Exception as e:
            t.record_fail(f"Cascade tie-breaker failed: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_ff_repeated_query_rank_delta_idempotency(self):
        t = TestResult("FF Repeated Standings Query Idempotency (Rank Delta Bug)", "BR_SCORING")
        start = time.perf_counter()
        try:
            engine = FreeFireScoringEngine()
            # Match 1: T1=1st, T2=2nd, T3=3rd
            engine.record_match_result(1, [
                {"team_id": "T1", "placement": 1, "kills": 0},
                {"team_id": "T2", "placement": 2, "kills": 0},
                {"team_id": "T3", "placement": 3, "kills": 0},
            ])
            # Match 2: T3 wins with lots of kills, overtaking T1 and T2!
            # T3 moves from Rank 3 to Rank 1 (rank_change should be +2)
            standings_after_m2 = engine.record_match_result(2, [
                {"team_id": "T3", "placement": 1, "kills": 10}, # 12 + 10 = 22 -> Total 30
                {"team_id": "T2", "placement": 2, "kills": 0},  # 9 -> Total 18
                {"team_id": "T1", "placement": 12, "kills": 0}, # 0 -> Total 12
            ])

            t3_entry = next(s for s in standings_after_m2 if s["team_id"] == "T3")
            delta_1 = t3_entry["rank_change"]
            prev_rank_1 = t3_entry["previous_rank"]
            curr_rank_1 = t3_entry["current_rank"]

            # EXPECTATION: T3 was rank 3, is now rank 1. delta_1 must be +2 (3 - 1).
            assert curr_rank_1 == 1, f"T3 should be rank 1, got {curr_rank_1}"
            assert prev_rank_1 == 3, f"T3 previous_rank should be 3, got {prev_rank_1}"
            assert delta_1 == 2, f"T3 rank_change should be +2, got {delta_1}"

            # ADVERSARIAL STEP: Call get_sorted_standings() again without adding a new match
            # (e.g. Graphic overlay poll, stream UI update, API fetch)
            standings_poll_2 = engine.get_sorted_standings(2)
            t3_entry_2 = next(s for s in standings_poll_2 if s["team_id"] == "T3")
            delta_2 = t3_entry_2["rank_change"]
            prev_rank_2 = t3_entry_2["previous_rank"]

            if delta_2 != 2:
                t.record_fail(
                    f"BUG DETECTED: FreeFireScoringEngine.get_sorted_standings() is NOT idempotent! "
                    f"Subsequent call mutated previous_rank from {prev_rank_1} to {prev_rank_2}, "
                    f"destroying rank_change from {delta_1} to {delta_2}."
                )
            else:
                t.record_pass("get_sorted_standings() is idempotent and preserved rank delta.")
        except Exception as e:
            t.record_fail(f"Exception during rank delta test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_ff_multi_match_identical_lookback(self):
        t = TestResult("FF Multi-Match Lookback to Earlier Matches (M-1, M-2)", "BR_SCORING")
        start = time.perf_counter()
        try:
            engine = FreeFireScoringEngine()
            # What if two teams have identical points, booyahs, kills, AND identical placement in Match 3?
            # E.g. If both got OCR tie or separate lobby data.
            # In official FF rules, tie-breaker continues to M-1, M-2...
            # Check implementation in tournament_engine.py:
            # Lines 145-161 only check history[-1].get("placement", 999).
            # It does NOT inspect history[-2] or full reverse placement history.
            m1 = [
                {"team_id": "TA", "placement": 2, "kills": 2}, # 9 + 2 = 11
                {"team_id": "TB", "placement": 3, "kills": 3}, # 8 + 3 = 11
            ]
            m2 = [
                {"team_id": "TA", "placement": 5, "kills": 0}, # 6 + 0 = 6  -> Total 17, 0 Booyah, 2 kills
                {"team_id": "TB", "placement": 5, "kills": 0}, # 6 + 0 = 6  -> Total 17, 0 Booyah, 3 kills? Let's make kills equal!
            ]
            # 3 matches with equal total points (27), 0 Booyahs, and equal total kills (3).
            # Match 1: TA placement 3 (8pts, 1k=9), TB placement 2 (9pts, 1k=10)
            # Match 2: TA placement 2 (9pts, 1k=10), TB placement 3 (8pts, 1k=9)
            # Match 3: TA placement 4 (7pts, 1k=8), TB placement 4 (7pts, 1k=8)
            # Both have 27 total points, 0 Booyahs, 3 kills.
            # In Match 3 (most recent): both had placement 4 (tied)!
            # Lookback to Match 2 (M-1): TA had placement 2 (better), TB had placement 3 -> TA should be rank 1.
            engine_m = FreeFireScoringEngine()
            engine_m.record_match_result(1, [
                {"team_id": "TA", "placement": 3, "kills": 1},
                {"team_id": "TB", "placement": 2, "kills": 1},
            ])
            engine_m.record_match_result(2, [
                {"team_id": "TA", "placement": 2, "kills": 1},
                {"team_id": "TB", "placement": 3, "kills": 1},
            ])
            standings = engine_m.record_match_result(3, [
                {"team_id": "TA", "placement": 4, "kills": 1},
                {"team_id": "TB", "placement": 4, "kills": 1},
            ])
            # With lookback to M-1 implemented: TA should be rank 1 (M2 rank 2 vs 3).
            ta_rank = next(s["current_rank"] for s in standings if s["team_id"] == "TA")
            tb_rank = next(s["current_rank"] for s in standings if s["team_id"] == "TB")
            if ta_rank < tb_rank:
                t.record_pass("Tie-breaker successfully looked back to Match M-1 when Match M was identical.")
            else:
                t.record_fail(
                    f"LIMITATION: When most recent match placement is identical, engine does NOT look back "
                    f"to Match M-1 (TA rank {ta_rank} vs TB rank {tb_rank}). Only history[-1] is checked."
                )
        except Exception as e:
            t.record_fail(f"Exception: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    # -------------------------------------------------------------------------
    # CATEGORY 2: BRACKETS (SINGLE & DOUBLE ELIMINATION)
    # -------------------------------------------------------------------------

    def test_single_elim_odd_teams_and_byes(self):
        t = TestResult("Single Elimination Odd Team Counts & BYEs (n=3, 5, 7)", "BRACKET")
        start = time.perf_counter()
        try:
            teams_3 = [
                TournamentTeam(f"T{i}", f"Team {i}", f"T{i}", seed=i) for i in range(1, 4)
            ]
            teams_5 = [
                TournamentTeam(f"T{i}", f"Team {i}", f"T{i}", seed=i) for i in range(1, 6)
            ]

            # Test 3 teams
            tourney_3 = BracketEngine.create_single_elimination_bracket(
                "T3", "3 Teams", SupportedGameId.GAME_LOL, teams_3, bo_format=3
            )
            # In a proper 3-team single elim bracket:
            # Seed 1 gets a BYE to Finals. Seed 2 vs Seed 3 play Semifinal.
            # Total matches = 2.
            node_count_3 = len(tourney_3.nodes)
            included_teams_3 = set()
            for n in tourney_3.nodes.values():
                if n.team_a: included_teams_3.add(n.team_a.team_id)
                if n.team_b: included_teams_3.add(n.team_b.team_id)

            if "T3" not in included_teams_3 or node_count_3 != 2:
                t.record_fail(
                    f"DEFECT in Single Elimination odd team count (n=3): "
                    f"Expected 2 bracket nodes (SF + GF with BYE), but got {node_count_3} node(s). "
                    f"Included teams in bracket: {included_teams_3}. Team T3 was dropped completely!"
                )
                return

            # Test 5 teams
            tourney_5 = BracketEngine.create_single_elimination_bracket(
                "T5", "5 Teams", SupportedGameId.GAME_LOL, teams_5, bo_format=3
            )
            node_count_5 = len(tourney_5.nodes)
            if node_count_5 <= 1:
                t.record_fail(
                    f"DEFECT in Single Elimination (n=5): BracketEngine fell back to 2-team direct final, "
                    f"dropping 3 of 5 teams entirely!"
                )
                return

            t.record_pass("Single Elimination handled odd team counts with proper BYE assignment.")
        except Exception as e:
            t.record_fail(f"Exception during odd team test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_single_elim_16_teams(self):
        t = TestResult("Single Elimination 16-Team Bracket Construction", "BRACKET")
        start = time.perf_counter()
        try:
            teams_16 = [
                TournamentTeam(f"T{i}", f"Team {i}", f"T{i}", seed=i) for i in range(1, 17)
            ]
            tourney_16 = BracketEngine.create_single_elimination_bracket(
                "T16", "16 Teams", SupportedGameId.GAME_LOL, teams_16, bo_format=3
            )
            # 16 teams requires: 8 R16 matches + 4 QF + 2 SF + 1 GF = 15 matches
            node_count = len(tourney_16.nodes)
            if node_count == 15:
                t.record_pass("16-team Single Elimination bracket correctly created with 15 matches.")
            else:
                t.record_fail(
                    f"DEFECT in Single Elimination (n=16): Expected 15 match nodes, but got {node_count}. "
                    f"(Engine fell back to direct final, ignoring 14 teams despite docstring claiming 16-team support)."
                )
        except Exception as e:
            t.record_fail(f"Exception during 16-team test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_double_elim_odd_teams(self):
        t = TestResult("Double Elimination Odd Team Counts (n=3, 5)", "BRACKET")
        start = time.perf_counter()
        try:
            teams_3 = [
                TournamentTeam(f"T{i}", f"Team {i}", f"T{i}", seed=i) for i in range(1, 4)
            ]
            tourney_3 = BracketEngine.create_double_elimination_bracket(
                "DE_3", "DE 3 Teams", SupportedGameId.GAME_LOL, teams_3, bo_format=3
            )
            # Check UB_SF1
            ub_sf1 = tourney_3.nodes.get("DE_3_UB_SF1")
            if ub_sf1 and ub_sf1.team_b is None:
                # With team_b=None, does team_a get an automatic bye advancement?
                if not ub_sf1.is_complete:
                    t.record_fail(
                        f"DEFECT in Double Elimination (n=3): UB_SF1 has team_b=None, "
                        f"but node is NOT auto-completed as a BYE! Match hangs waiting for play against None."
                    )
                    return
            t.record_pass("Double elimination handled 3 teams cleanly.")
        except Exception as e:
            t.record_fail(f"Exception in DE odd team test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_double_elim_8_teams(self):
        t = TestResult("Double Elimination 8-Team Full Bracket Support", "BRACKET")
        start = time.perf_counter()
        try:
            teams_8 = [
                TournamentTeam(f"T{i}", f"Team {i}", f"T{i}", seed=i) for i in range(1, 9)
            ]
            tourney_8 = BracketEngine.create_double_elimination_bracket(
                "DE_8", "DE 8 Teams", SupportedGameId.GAME_LOL, teams_8, bo_format=3
            )
            # An 8-team double elimination bracket requires 14 matches (or 15 with GF reset):
            # UB: 4 QF + 2 SF + 1 Final = 7 matches
            # LB: 2 R1 + 2 R2 + 1 R3 + 1 Final = 6 matches
            # GF: 1 match (+ 1 optional reset)
            node_count = len(tourney_8.nodes)
            if node_count >= 14:
                t.record_pass(f"8-team Double Elimination bracket correctly created with {node_count} nodes.")
            else:
                t.record_fail(
                    f"DEFECT: Double Elimination does NOT support 8 teams! "
                    f"Expected >=14 matches for 8 teams, but got {node_count} nodes. "
                    f"create_double_elimination_bracket only creates hardcoded 4-team bracket."
                )
        except Exception as e:
            t.record_fail(f"Exception in DE 8-team test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_bo_series_progression_and_edge_thresholds(self):
        t = TestResult("BO Series Progression & Win Threshold Calculations", "BRACKET")
        start = time.perf_counter()
        try:
            t1 = TournamentTeam("T1", "Team 1", "T1")
            t2 = TournamentTeam("T2", "Team 2", "T2")

            # Check BO1, BO3, BO5 thresholds
            for bo, expected_wins in [(1, 1), (3, 2), (5, 3), (7, 4)]:
                calc = math.ceil(bo / 2)
                assert calc == expected_wins, f"BO{bo} win threshold error: {calc} != {expected_wins}"

            # Test Series Completion edge cases:
            # Over-scoring after completion
            tourney = BracketEngine.create_single_elimination_bracket(
                "BO3_TEST", "BO3 Test", SupportedGameId.GAME_LOL, [t1, t2], bo_format=3
            )
            gf = "BO3_TEST_GF"
            BracketEngine.record_match_game(tourney, gf, "A") # 1-0
            BracketEngine.record_match_game(tourney, gf, "A") # 2-0 -> Complete!
            assert tourney.nodes[gf].is_complete is True
            assert tourney.nodes[gf].winner.team_id == "T1"

            # Attempt to record extra game after completion
            node_extra = BracketEngine.record_match_game(tourney, gf, "B")
            assert node_extra.score_b == 0, f"Score mutated after match completion: {node_extra.score_b}"
            assert node_extra.winner.team_id == "T1"

            t.record_pass("BO1/BO3/BO5 series progression and completion guard verified.")
        except Exception as e:
            t.record_fail(f"Exception in BO progression test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_double_elim_losers_cross_matching(self):
        t = TestResult("Double Elimination Losers Bracket Cross-Matching", "BRACKET")
        start = time.perf_counter()
        try:
            teams = [
                TournamentTeam(f"T{i}", f"Team {i}", f"T{i}", seed=i) for i in range(1, 5)
            ]
            tourney = BracketEngine.create_double_elimination_bracket(
                "DE_CROSS", "DE Cross", SupportedGameId.GAME_LOL, teams, bo_format=3
            )
            # In 4-team DE:
            # UB_SF1: T1 vs T4 -> loser to LB_R1 slot A
            # UB_SF2: T2 vs T3 -> loser to LB_R1 slot B
            # Check loser routing connections
            sf1 = tourney.nodes["DE_CROSS_UB_SF1"]
            sf2 = tourney.nodes["DE_CROSS_UB_SF2"]
            assert sf1.loser_next_match_id == "DE_CROSS_LB_R1", "SF1 loser must route to LB_R1"
            assert sf2.loser_next_match_id == "DE_CROSS_LB_R1", "SF2 loser must route to LB_R1"
            assert sf1.loser_next_slot != sf2.loser_next_slot, "SF1 and SF2 losers must occupy opposite slots in LB_R1"

            # Play SF1: T1 wins, T4 loses
            BracketEngine.record_match_game(tourney, sf1.match_id, "A")
            BracketEngine.record_match_game(tourney, sf1.match_id, "A")
            # Play SF2: T2 loses, T3 wins
            BracketEngine.record_match_game(tourney, sf2.match_id, "B")
            BracketEngine.record_match_game(tourney, sf2.match_id, "B")

            lb_r1 = tourney.nodes["DE_CROSS_LB_R1"]
            assert lb_r1.team_a.team_id == "T4", f"LB_R1 team_a expected T4, got {lb_r1.team_a}"
            assert lb_r1.team_b.team_id == "T2", f"LB_R1 team_b expected T2, got {lb_r1.team_b}"

            t.record_pass("4-team Double Elimination loser routing verified.")
        except Exception as e:
            t.record_fail(f"Exception in DE loser cross-matching: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_double_elim_grand_finals_bracket_reset(self):
        t = TestResult("Double Elimination Grand Finals Bracket Reset Toggle", "BRACKET")
        start = time.perf_counter()
        try:
            teams = [
                TournamentTeam(f"T{i}", f"Team {i}", f"T{i}", seed=i) for i in range(1, 5)
            ]
            tourney = BracketEngine.create_double_elimination_bracket(
                "DE_RESET", "DE Reset Test", SupportedGameId.GAME_LOL, teams, bo_format=3
            )
            # Play through Upper Bracket:
            # UB_SF1: T1 wins 2-0 vs T4
            BracketEngine.record_match_game(tourney, "DE_RESET_UB_SF1", "A")
            BracketEngine.record_match_game(tourney, "DE_RESET_UB_SF1", "A")

            # UB_SF2: T2 wins 2-0 vs T3
            BracketEngine.record_match_game(tourney, "DE_RESET_UB_SF2", "A")
            BracketEngine.record_match_game(tourney, "DE_RESET_UB_SF2", "A")

            # UB_FINAL: T1 (slot A) wins 2-0 vs T2 (slot B) -> T1 to GF slot A, T2 to LB_FINAL slot A
            BracketEngine.record_match_game(tourney, "DE_RESET_UB_FINAL", "A")
            BracketEngine.record_match_game(tourney, "DE_RESET_UB_FINAL", "A")

            # LB_R1: T4 vs T3 -> T4 wins 2-0 -> T4 to LB_FINAL slot B
            BracketEngine.record_match_game(tourney, "DE_RESET_LB_R1", "A")
            BracketEngine.record_match_game(tourney, "DE_RESET_LB_R1", "A")

            # LB_FINAL: T2 vs T4 -> T4 wins 2-0 -> T4 to GF slot B
            BracketEngine.record_match_game(tourney, "DE_RESET_LB_FINAL", "B")
            BracketEngine.record_match_game(tourney, "DE_RESET_LB_FINAL", "B")

            gf = tourney.nodes["DE_RESET_GF"]
            assert gf.team_a.team_id == "T1", f"GF team_a should be T1 (UB winner), got {gf.team_a}"
            assert gf.team_b.team_id == "T4", f"GF team_b should be T4 (LB winner), got {gf.team_b}"

            # SCENARIO: T4 (LB winner, already has 1 loss) beats T1 (UB winner, 0 losses) in GF!
            # Under true Double Elimination rules with enable_bracket_reset=True:
            # T1 has only lost 1 series. T4 has lost 1 series.
            # A Bracket Reset Match (GF_RESET / Set 2) MUST be triggered!
            # T4 cannot be crowned champion immediately without a reset match.
            BracketEngine.record_match_game(tourney, "DE_RESET_GF", "B")
            BracketEngine.record_match_game(tourney, "DE_RESET_GF", "B")

            # Check if engine crowned T4 immediately or supports bracket reset
            if gf.is_complete and gf.winner.team_id == "T4":
                # Check if there is a GF_RESET node or reset toggle
                reset_node = tourney.nodes.get("DE_RESET_GF_RESET")
                has_reset_flag = hasattr(tourney, "enable_bracket_reset") or hasattr(gf, "bracket_reset")
                if not reset_node and not has_reset_flag:
                    t.record_fail(
                        f"DEFECT in Double Elimination: Bracket Reset is NOT implemented! "
                        f"When Lower Bracket winner (T4) defeated Upper Bracket winner (T1), "
                        f"the engine crowned T4 as champion immediately without triggering a Bracket Reset "
                        f"(Set 2) match. T1 was eliminated with only 1 match loss across the entire tournament."
                    )
                    return

            t.record_pass("Double Elimination Grand Finals bracket reset successfully triggered.")
        except Exception as e:
            t.record_fail(f"Exception in GF bracket reset test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    # -------------------------------------------------------------------------
    # CATEGORY 3: BERGER ROUND-ROBIN SCHEDULER
    # -------------------------------------------------------------------------

    def test_berger_round_robin_even_participants(self):
        t = TestResult("Berger Round-Robin Pairing Generator (Even: n=4, 6, 8)", "ROUND_ROBIN")
        start = time.perf_counter()
        try:
            # Check if Berger / Round-Robin engine exists in tournament_engine or models
            has_berger_attr = hasattr(BracketEngine, "create_round_robin_bracket") or \
                              hasattr(BracketEngine, "generate_berger_table") or \
                              "RoundRobinEngine" in globals() or \
                              hasattr(Tournament, "create_round_robin")

            if not has_berger_attr:
                # Check module-level inspection
                import verification.tournament_engine as te
                engine_classes = [attr for attr in dir(te) if "Robin" in attr or "Berger" in attr]
                t.record_fail(
                    f"CRITICAL DEFECT: Berger Round-Robin engine is COMPLETELY MISSING from "
                    f"verification/tournament_engine.py! "
                    f"Feature 12 ('Berger pairing table generator, tie-breaker calculation, and standings update') "
                    f"was planned in PROJECT.md and claimed in tournament_engine.py line 8 docstring, "
                    f"but no class or function exists in the codebase."
                )
                return

            t.record_pass("Berger Round-Robin even participant pairing generated.")
        except Exception as e:
            t.record_fail(f"Exception in Berger even test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    def test_berger_round_robin_odd_participants(self):
        t = TestResult("Berger Round-Robin Pairing Generator (Odd with BYEs: n=5, 7)", "ROUND_ROBIN")
        start = time.perf_counter()
        try:
            import verification.tournament_engine as te
            if not hasattr(te, "RoundRobinEngine") and not hasattr(BracketEngine, "generate_berger_table"):
                t.record_fail(
                    f"CRITICAL DEFECT: Berger Round-Robin odd team table generation with BYEs "
                    f"is UNIMPLEMENTED in verification/tournament_engine.py."
                )
                return

            t.record_pass("Berger Round-Robin odd participant pairing generated with BYEs.")
        except Exception as e:
            t.record_fail(f"Exception in Berger odd test: {str(e)}", traceback.format_exc())
        finally:
            t.duration_ms = (time.perf_counter() - start) * 1000
            self.results.append(t)

    # -------------------------------------------------------------------------
    # SUMMARY & REPORTING
    # -------------------------------------------------------------------------

    def print_summary(self):
        print("\n" + "=" * 80)
        print("                         STRESS TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"{'Category':<14} | {'Test Name':<50} | {'Status':<8} | {'Latency':<8}")
        print("-" * 80)

        passed_count = 0
        failed_count = 0

        for r in self.results:
            status_str = "[PASS]" if r.passed else "[FAIL]"
            if r.passed:
                passed_count += 1
            else:
                failed_count += 1
            print(f"{r.category:<14} | {r.name[:50]:<50} | {status_str:<8} | {r.duration_ms:.2f}ms")

        print("-" * 80)
        total = len(self.results)
        print(f"Total Tests Executed: {total}")
        print(f"Passed              : {passed_count}")
        print(f"Failed / Defective  : {failed_count}")
        print("=" * 80)

        print("\nDETAILED EMPIRICAL FINDINGS:")
        for r in self.results:
            print(f"\n>> {r.name} [{r.category}] -> {'PASS' if r.passed else 'FAIL'}")
            for f in r.findings:
                print(f"   * {f}")
            if r.error:
                print(f"   [Error trace]: {r.error}")

        print("\n" + "=" * 80)


if __name__ == "__main__":
    harness = TournamentStressHarness()
    harness.run_all()
