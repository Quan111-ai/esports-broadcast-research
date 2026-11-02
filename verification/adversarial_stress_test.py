"""
verification/adversarial_stress_test.py

Adversarial Stress Test Suite for Esports Tournament Livestream Application.
Authored by challenger_1 (Empirical Challenger & Adversarial Reviewer).

Empirically challenges:
1. Telemetry Ingestion under High Event Rates (1000 events/sec) to verify processing SLA (<50ms).
2. Malformed JSON / OCR packets, invalid enums, out-of-order timestamps, and missing fields.
3. Instant Rescue Override Locking (is_manual_locked) for scores, gold, and hero swaps against late-arriving telemetry.
4. Connection failure and freeze-frame buffer behavior during disconnects / empty packets.
"""

from __future__ import annotations
import unittest
import time
import copy
import uuid
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from typing import Dict, Any, List

from verification.models import (
    MatchTelemetryEvent,
    SupportedGameId,
    GameGenre,
    GamePhase,
    SpikeState,
    BroadcastScene,
    TeamState,
    PlayerState,
    MobaPayload,
    TacticalShooterPayload,
    BattleRoyalePayload,
    BRTeamSummary,
    TelemetryMetadata,
)
from verification.scene_router import SceneRouter
from verification.simulator import EsportsSimulator


class TestAdversarialHighEventRateIngestionSLA(unittest.TestCase):
    """
    Challenge 1: Telemetry ingestion under high event rates (1000 events/sec).
    Verifies processing SLA (<50ms per event) and peak burst resilience.
    """

    def setUp(self):
        self.router = SceneRouter()

    def test_adv_01_moba_1000_eps_continuous_ingestion_sla(self):
        """
        Stream 1,000 MOBA JSON packets through deserialization and scene routing.
        Assert that average latency < 5ms and max peak latency < 50ms.
        """
        sample_dict = MatchTelemetryEvent(
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                game_time_seconds=300,
                blue_team=TeamState("T1", "BLUE", "T1 Esports", "T1", score=1, kills=5),
                red_team=TeamState("GEN", "RED", "Gen.G", "GEN", score=0, kills=3),
                gold_difference=1500,
            ),
        ).to_dict()

        latencies_ms: List[float] = []
        t_start = time.perf_counter()

        for i in range(1000):
            # Dynamic payload modification
            sample_dict["sequence_id"] = i + 1
            sample_dict["timestamp_game_ms"] = (i + 1) * 1000
            sample_dict["payload"]["game_time_seconds"] = i + 1
            sample_dict["payload"]["gold_difference"] = i * 10

            t0 = time.perf_counter()
            event = MatchTelemetryEvent.from_dict(sample_dict)
            state = self.router.route_event(event)
            latencies_ms.append((time.perf_counter() - t0) * 1000.0)

        total_duration_ms = (time.perf_counter() - t_start) * 1000.0
        avg_latency = sum(latencies_ms) / len(latencies_ms)
        p95_latency = sorted(latencies_ms)[int(len(latencies_ms) * 0.95)]
        p99_latency = sorted(latencies_ms)[int(len(latencies_ms) * 0.99)]
        max_latency = max(latencies_ms)
        throughput = 1000.0 / (total_duration_ms / 1000.0)

        print(f"\n[ADV-01] 1,000 MOBA Events Ingested:")
        print(f"  Total Duration : {total_duration_ms:.2f} ms")
        print(f"  Throughput     : {throughput:.1f} events/sec")
        print(f"  Avg Latency    : {avg_latency:.4f} ms")
        print(f"  P95 Latency    : {p95_latency:.4f} ms")
        print(f"  P99 Latency    : {p99_latency:.4f} ms")
        print(f"  Max Latency    : {max_latency:.4f} ms (SLA < 50ms)")

        self.assertLess(avg_latency, 5.0, "Average ingestion latency must be < 5.0ms")
        self.assertLess(max_latency, 50.0, "Peak ingestion latency must not exceed 50.0ms SLA")
        self.assertGreater(throughput, 1000.0, "Throughput must exceed 1000 events/sec")

    def test_adv_02_battle_royale_12_team_heavy_ingestion_sla(self):
        """
        Stream 1,000 heavy 12-team 48-player Free Fire packets.
        Assert that complex nested structures deserialize and route within <50ms SLA.
        """
        br_teams = []
        for i in range(1, 13):
            players = [
                PlayerState(f"P_{i}_{p}", p, f"Player_{i}_{p}", kills=p, health_current=100)
                for p in range(4)
            ]
            br_teams.append(BRTeamSummary(
                team_id=f"T_{i}",
                slot_number=i,
                team_name=f"Team {i:02d}",
                team_short_code=f"T{i}",
                alive_players_count=4,
                is_eliminated=False,
                match_kills=i,
                players=players,
            ))

        br_dict = MatchTelemetryEvent(
            game_id=SupportedGameId.GAME_FREEFIRE,
            game_genre=GameGenre.BATTLE_ROYALE,
            phase=GamePhase.IN_GAME,
            payload=BattleRoyalePayload(
                match_index=1,
                alive_teams_count=12,
                alive_players_count=48,
                zone_phase=2,
                teams=br_teams,
            ),
        ).to_dict()

        latencies_ms: List[float] = []
        t_start = time.perf_counter()

        for i in range(1000):
            br_dict["sequence_id"] = i + 1
            t0 = time.perf_counter()
            event = MatchTelemetryEvent.from_dict(br_dict)
            state = self.router.route_event(event)
            latencies_ms.append((time.perf_counter() - t0) * 1000.0)

        total_duration_ms = (time.perf_counter() - t_start) * 1000.0
        avg_latency = sum(latencies_ms) / len(latencies_ms)
        max_latency = max(latencies_ms)

        print(f"\n[ADV-02] 1,000 12-Team Battle Royale Events Ingested:")
        print(f"  Total Duration : {total_duration_ms:.2f} ms")
        print(f"  Avg Latency    : {avg_latency:.4f} ms")
        print(f"  Max Latency    : {max_latency:.4f} ms (SLA < 50ms)")

        self.assertLess(avg_latency, 5.0)
        self.assertLess(max_latency, 50.0)

    def test_adv_03_burst_traffic_queue_resilience_5000_events(self):
        """
        Stress-test pipeline with a 5,000-event burst to verify linear scaling
        and ensure no latency spike from garbage collection or internal state leaks.
        """
        sim = EsportsSimulator()
        base_event = sim.simulate_lol_match("BURST_M1")[2]  # IN_GAME event
        base_dict = base_event.to_dict()

        latencies_ms = []
        t_start = time.perf_counter()
        for i in range(5000):
            base_dict["sequence_id"] = i + 1
            t0 = time.perf_counter()
            ev = MatchTelemetryEvent.from_dict(base_dict)
            st = self.router.route_event(ev)
            latencies_ms.append((time.perf_counter() - t0) * 1000.0)

        total_ms = (time.perf_counter() - t_start) * 1000.0
        p99 = sorted(latencies_ms)[int(len(latencies_ms) * 0.99)]
        max_lat = max(latencies_ms)

        print(f"\n[ADV-03] 5,000 Burst Events:")
        print(f"  Total Duration : {total_ms:.2f} ms")
        print(f"  P99 Latency    : {p99:.4f} ms")
        print(f"  Max Latency    : {max_lat:.4f} ms")

        self.assertLess(max_lat, 50.0)


class TestAdversarialMalformedPacketsAndEdgeCases(unittest.TestCase):
    """
    Challenge 2: Malformed JSON / OCR packets, invalid coordinates,
    out-of-order timestamps, and missing fields.
    """

    def setUp(self):
        self.router = SceneRouter()

    def test_adv_04_ocr_misread_enum_values_unhandled_crash(self):
        """
        REMEDIATION VERIFIED:
        OCR text recognition frequently produces character substitutions (e.g. '0' for 'O').
        Passing 'GAME_L0L' or 'IN-GAME' is gracefully normalized without raising ValueError.
        """
        malformed_game_id = {
            "game_id": "GAME_L0L",  # Typo: zero instead of O
            "game_genre": "MOBA",
            "phase": "IN_GAME",
            "payload": {},
        }
        ev_game = MatchTelemetryEvent.from_dict(malformed_game_id)
        self.assertEqual(ev_game.game_id, SupportedGameId.GAME_LOL)
        print(f"\n[ADV-04] Robustness Verified: OCR typo 'GAME_L0L' normalized to {ev_game.game_id.value}")

        malformed_phase = {
            "game_id": "GAME_LOL",
            "game_genre": "MOBA",
            "phase": "IN-GAME",  # Hyphen instead of underscore
            "payload": {},
        }
        ev_phase = MatchTelemetryEvent.from_dict(malformed_phase)
        self.assertEqual(ev_phase.phase, GamePhase.IN_GAME)
        print(f"[ADV-04] Robustness Verified: OCR phase 'IN-GAME' normalized to {ev_phase.phase.value}")

    def test_adv_05_null_team_state_crashes_scene_router(self):
        """
        REMEDIATION VERIFIED:
        When OCR or network packet contains null/missing team payload ('blue_team': None),
        from_dict injects safe default TeamState, and SceneRouter routes safely without AttributeError.
        """
        raw_data = {
            "game_id": "GAME_LOL",
            "game_genre": "MOBA",
            "phase": "IN_GAME",
            "payload": {"blue_team": None, "red_team": None},
        }
        event = MatchTelemetryEvent.from_dict(raw_data)
        self.assertIsNotNone(event.payload.blue_team)

        state = self.router.route_event(event)
        self.assertIsNotNone(state)
        self.assertEqual(state.canvas_16_9["top_bar_hud"]["team_a_name"], "Team Blue")
        print(f"\n[ADV-05] Robustness Verified: Null blue_team payload gracefully handled with safe defaults")

    def test_adv_06_tactical_shooter_null_attacker_crashes_router(self):
        """
        REMEDIATION VERIFIED:
        TacticalShooterPayload with attacking_team=None defaults to TeamState and routes safely.
        """
        raw_data = {
            "game_id": "GAME_VALORANT",
            "game_genre": "TACTICAL_SHOOTER",
            "phase": "IN_GAME",
            "payload": {"attacking_team": None, "defending_team": None},
        }
        event = MatchTelemetryEvent.from_dict(raw_data)
        state = self.router.route_event(event)
        self.assertIsNotNone(state)
        self.assertEqual(state.canvas_16_9["top_bar_hud"]["team_a_name"], "Attackers")
        print(f"\n[ADV-06] Robustness Verified: Null attacking_team gracefully handled with safe defaults")

    def test_adv_07_out_of_order_packets_cause_state_regression(self):
        """
        REMEDIATION VERIFICATION:
        SceneRouter has sequence_id monotonicity checks.
        A delayed older packet (seq 95) is dropped and does not rewind kills or score from seq 100!
        """
        ev_new = MatchTelemetryEvent(
            sequence_id=100,
            timestamp_game_ms=60000,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                blue_team=TeamState("T1", "BLUE", "T1 Esports", "T1", score=1, kills=15),
                red_team=TeamState("GEN", "RED", "Gen.G", "GEN", score=0, kills=10),
            ),
        )
        st_new = self.router.route_event(ev_new)
        self.assertEqual(st_new.canvas_16_9["top_bar_hud"]["kills_a"], 15)

        # Late-arriving delayed packet (seq 95)
        ev_old = MatchTelemetryEvent(
            sequence_id=95,
            timestamp_game_ms=55000,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                blue_team=TeamState("T1", "BLUE", "T1 Esports", "T1", score=1, kills=8),
                red_team=TeamState("GEN", "RED", "Gen.G", "GEN", score=0, kills=6),
            ),
        )
        st_regressed = self.router.route_event(ev_old)

        # Verifying regression prevention: kills maintained at 15!
        kills_after_late_packet = st_regressed.canvas_16_9["top_bar_hud"]["kills_a"]
        print(f"\n[ADV-07] Resilience Verified: Out-of-order packet (seq 95 after seq 100) dropped; kills maintained at {kills_after_late_packet}")
        self.assertEqual(kills_after_late_packet, 15, "Resilience verified: SceneRouter dropped older packet and prevented live state regression")

    def test_adv_08_empty_dict_from_dict_handling(self):
        """
        Test resilience when from_dict is called with an empty dictionary.
        Verifies default fallback behavior.
        """
        ev = MatchTelemetryEvent.from_dict({})
        self.assertEqual(ev.game_id, SupportedGameId.GAME_LOL)
        self.assertEqual(ev.game_genre, GameGenre.MOBA)
        self.assertEqual(ev.phase, GamePhase.IN_GAME)
        st = self.router.route_event(ev)
        self.assertEqual(st.active_scene, BroadcastScene.SCENE_IN_GAME)
        print(f"\n[ADV-08] Robustness Verified: Empty dictionary gracefully falls back to default MOBA IN_GAME state")


class TestAdversarialInstantRescueOverrideLocking(unittest.TestCase):
    """
    Challenge 3: Instant rescue override locking (is_manual_locked).
    Verifies whether operator overrides can be overwritten by late-arriving automated telemetry.
    """

    def setUp(self):
        self.router = SceneRouter()

    def test_adv_09_event_metadata_is_manual_locked_is_ignored_by_router(self):
        """
        REMEDIATION VERIFICATION:
        PROJECT.md Contract defines:
          metadata: { is_manual_locked: boolean, source: string }
        When an operator sends an event with is_manual_locked=True from a rescue tool,
        SceneRouter.route_event honors metadata.is_manual_locked.
        A subsequent automated packet with is_manual_locked=False cannot overwrite the operator fix!
        """
        # Step 1: Operator manually fixes score to 5 via rescue panel
        ev_operator = MatchTelemetryEvent(
            sequence_id=1,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                blue_team=TeamState("T1", "BLUE", "T1 Esports", "T1", score=5),
                red_team=TeamState("GEN", "RED", "Gen.G", "GEN", score=0),
            ),
            metadata=TelemetryMetadata(
                is_manual_locked=True,
                locked_fields={"score_a", "blue_team.score"},
                source="operator_rescue_panel",
            ),
        )
        st1 = self.router.route_event(ev_operator)
        self.assertEqual(st1.canvas_16_9["top_bar_hud"]["score_a"], 5)

        # Step 2: Late-arriving automated telemetry packet arrives with score=1
        ev_auto = MatchTelemetryEvent(
            sequence_id=2,
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                blue_team=TeamState("T1", "BLUE", "T1 Esports", "T1", score=1),
                red_team=TeamState("GEN", "RED", "Gen.G", "GEN", score=0),
            ),
            metadata=TelemetryMetadata(
                is_manual_locked=False,
                locked_fields=set(),
                source="auto_telemetry",
            ),
        )
        st2 = self.router.route_event(ev_auto)

        # VERIFICATION: Score protected at 5!
        score_after_auto = st2.canvas_16_9["top_bar_hud"]["score_a"]
        print(f"\n[ADV-09] Robustness Verified: Event metadata is_manual_locked is respected by SceneRouter!")
        print(f"  Operator manual fix: 5")
        print(f"  After late automated telemetry: {score_after_auto}")
        self.assertEqual(score_after_auto, 5, "Robustness verified: Automated packet did not overwrite operator manual lock")

    def test_adv_10_manual_override_unsupported_fields_overwritten(self):
        """
        REMEDIATION VERIFICATION:
        SceneRouter._get_effective_scores applies manual_locks for critical match fields
        including gold_lead and timer, protecting them from incoming telemetry overwrites.
        """
        ev1 = MatchTelemetryEvent(
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                blue_team=TeamState("T1", "BLUE", "T1", "T1", score=1),
                gold_difference=1000,
            ),
        )
        self.router.route_event(ev1)

        # Operator locks gold_lead on rescue panel to 5000
        self.router.set_manual_override("gold_lead", 5000)
        self.assertTrue(self.router.is_field_locked("gold_lead"))

        # Incoming telemetry sends gold_difference = 1200
        ev2 = MatchTelemetryEvent(
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                blue_team=TeamState("T1", "BLUE", "T1", "T1", score=1),
                gold_difference=1200,
            ),
        )
        st2 = self.router.route_event(ev2)

        # VERIFICATION: gold_lead lock preserved at 5000!
        actual_gold = st2.canvas_16_9["top_bar_hud"]["gold_lead"]
        print(f"\n[ADV-10] Robustness Verified: gold_lead lock was respected by _get_effective_scores!")
        print(f"  Locked value   : 5000")
        print(f"  Actual on HUD  : {actual_gold}")
        self.assertEqual(actual_gold, 5000, "Robustness verified: gold_lead lock respected")

    def test_adv_11_hero_swap_override_support_missing(self):
        """
        REMEDIATION VERIFICATION:
        Skill 03 mandates: 1-Click Hero Swap (<50ms) to swap two champions/players.
        SceneRouter canvas_16_9 contains roster state in sidebars and provides swap_heroes API.
        """
        p1 = PlayerState("P1", 0, "Bang", character_name="Nakroth")
        p2 = PlayerState("P2", 1, "Fish", character_name="Krixi")
        ev = MatchTelemetryEvent(
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(blue_team=TeamState("SGP", "BLUE", "SGP", "SGP", roster=[p1, p2])),
        )
        st = self.router.route_event(ev)

        # Inspect sidebar layout
        sidebar = st.canvas_16_9.get("left_roster_sidebar", {})
        has_roster_data = "roster" in sidebar or "players" in sidebar
        has_hero_swap_api = hasattr(self.router, "swap_heroes") or hasattr(self.router, "set_hero_swap_override")

        print(f"\n[ADV-11] Architecture Verified:")
        print(f"  Sidebar contains player data: {has_roster_data}")
        print(f"  Router has hero swap API    : {has_hero_swap_api}")
        self.assertTrue(has_roster_data, "Verified: left_roster_sidebar contains roster state")
        self.assertTrue(has_hero_swap_api, "Verified: SceneRouter implements hero swap rescue API")
        self.assertTrue(self.router.swap_heroes("P1", "P2"), "Hero swap executed successfully")


class TestAdversarialConnectionFailureAndFreezeFrame(unittest.TestCase):
    """
    Challenge 4: Connection failure and freeze-frame buffer behavior.
    """

    def setUp(self):
        self.router = SceneRouter()

    def test_adv_12_empty_packet_wipes_freeze_frame_to_zero(self):
        """
        REMEDIATION VERIFICATION:
        PROJECT.md & Skill 03 guarantee: Freeze-Frame buffer keeps scores intact
        during connection drops. Under no circumstances should the scoreboard jump to 0.
        When a disconnect packet arrives with payload=None, SceneRouter maintains
        the last known valid scores and team names in top_bar_hud.
        """
        # Step 1: Active game state with real scores
        ev_active = MatchTelemetryEvent(
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                blue_team=TeamState("T1", "BLUE", "T1 Esports", "T1", score=2, kills=15),
                red_team=TeamState("GEN", "RED", "Gen.G", "GEN", score=1, kills=10),
            ),
        )
        st_active = self.router.route_event(ev_active)
        self.assertEqual(st_active.canvas_16_9["top_bar_hud"]["score_a"], 2)
        self.assertEqual(st_active.canvas_16_9["top_bar_hud"]["team_a_name"], "T1 Esports")

        # Step 2: Connection drop sends disconnect / empty payload
        ev_drop = MatchTelemetryEvent(phase=GamePhase.IN_GAME, payload=None)
        st_dropped = self.router.route_event(ev_drop)

        # VERIFICATION: Scoreboard and team name maintained in freeze-frame!
        score_after_drop = st_dropped.canvas_16_9["top_bar_hud"]["score_a"]
        name_after_drop = st_dropped.canvas_16_9["top_bar_hud"]["team_a_name"]

        print(f"\n[ADV-12] Robustness Verified: Disconnect packet preserved Freeze-Frame Buffer!")
        print(f"  Score before drop : 2 (T1 Esports)")
        print(f"  Score after drop  : {score_after_drop} ({name_after_drop})")

        self.assertEqual(score_after_drop, 2, "Robustness verified: Scoreboard retained in freeze frame buffer on disconnect")
        self.assertEqual(name_after_drop, "T1 Esports", "Robustness verified: Team name retained in freeze frame buffer on disconnect")

    def test_adv_13_absence_of_heartbeat_monitor_in_scene_router(self):
        """
        REMEDIATION VERIFICATION:
        Skill 03 defines ConnectionHealthMonitor with 500ms heartbeat,
        1500ms stale warning, and 3000ms reconnecting thresholds.
        SceneRouter provides heartbeat tracking, stale warning state, and connection health interface.
        """
        has_health_monitor = hasattr(self.router, "check_health") or hasattr(self.router, "heartbeat_monitor")
        has_stale_warning = hasattr(self.router, "is_stale")

        print(f"\n[ADV-13] Verified: SceneRouter implements connection health / heartbeat monitor interface:")
        print(f"  has_health_monitor: {has_health_monitor}")
        print(f"  has_stale_warning  : {has_stale_warning}")

        self.assertTrue(has_health_monitor, "Verified: SceneRouter implements heartbeat monitoring")
        self.assertTrue(has_stale_warning, "Verified: SceneRouter implements stale detection")

    def test_adv_14_negative_game_clock_unhandled_formatting(self):
        """
        REMEDIATION VERIFICATION:
        Pre-match countdown or negative game clock (e.g. -30 seconds before minion spawn)
        produces valid formatted timer display '-00:30'.
        """
        ev = MatchTelemetryEvent(
            phase=GamePhase.IN_GAME,
            payload=MobaPayload(
                game_time_seconds=-30,
                blue_team=TeamState("T1", "BLUE", "T1", "T1", score=1),
            ),
        )
        st = self.router.route_event(ev)
        timer_str = st.canvas_16_9["top_bar_hud"]["timer"]
        print(f"\n[ADV-14] Formatting Verified: Negative game_time_seconds (-30s) produces: '{timer_str}'")
        self.assertEqual(timer_str, "-00:30", "Formatting verified: Negative game_time_seconds formats cleanly as -00:30")

    def test_adv_15_concurrent_operator_and_telemetry_threads(self):
        """
        CONCURRENCY STRESS:
        Run high-rate telemetry ingestion (1,000 events) concurrently with rapid
        operator manual rescue interventions (500 pause/resume/override cycles)
        across separate threads.
        """
        import threading
        errors = []

        def telemetry_worker():
            for i in range(1000):
                ev = MatchTelemetryEvent(
                    sequence_id=i,
                    phase=GamePhase.IN_GAME,
                    payload=MobaPayload(blue_team=TeamState("T1", "BLUE", "T1", "T1", score=i % 10)),
                )
                try:
                    self.router.route_event(ev)
                except Exception as e:
                    errors.append(e)

        def operator_worker():
            for i in range(500):
                try:
                    self.router.set_manual_override("score_a", 99)
                    self.router.trigger_emergency_pause("CONCURRENT PAUSE")
                    self.router.resume_from_pause()
                    self.router.unlock_manual_override("score_a")
                except Exception as e:
                    errors.append(e)

        t1 = threading.Thread(target=telemetry_worker)
        t2 = threading.Thread(target=operator_worker)
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        print(f"\n[ADV-15] Concurrency Stress: 1000 telemetry events + 500 operator actions:")
        print(f"  Thread contention errors: {len(errors)}")
        self.assertEqual(len(errors), 0, "No unhandled exceptions during concurrent access")


def run_adversarial_suite():
    print("=" * 80)
    print("   ADVERSARIAL STRESS TEST SUITE - ESPORTS BROADCAST TELEMETRY & CONTROLS")
    print("   Agent: challenger_1 | Archetype: EMPIRICAL CHALLENGER")
    print("=" * 80)

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialHighEventRateIngestionSLA))
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialMalformedPacketsAndEdgeCases))
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialInstantRescueOverrideLocking))
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialConnectionFailureAndFreezeFrame))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result


if __name__ == "__main__":
    run_adversarial_suite()
