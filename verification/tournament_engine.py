"""
verification/tournament_engine.py

Tournament Management, Bracket DAG Progression, and Free Fire 12-Team Auto-Scoring Engine.
Implements:
- Single Elimination DAG bracket progression
- Double Elimination DAG bracket progression with Losers bracket routing
- Round-Robin Berger scheduler & standings
- Free Fire 12-team point calculation matrix (12/9/8/7/6/5/4/3/2/1/0/0 + Kills)
- Strict 4-tier tie-breakers (Total Points -> Booyahs -> Kill Points -> Recent Placement)
- Dynamic GPU Asset Pre-loader with fallback silhouettes (<50ms SLA)
"""

from __future__ import annotations
import math
import time
from typing import List, Dict, Any, Optional, Tuple
from verification.models import (
    Tournament,
    TournamentTeam,
    BracketNode,
    BracketFormat,
    SupportedGameId,
    PlayerState,
)


# Free Fire Official Placement Points Table (12 teams)
FREE_FIRE_PLACEMENT_POINTS: Dict[int, int] = {
    1: 12,  # Booyah!
    2: 9,
    3: 8,
    4: 7,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
    9: 2,
    10: 1,
    11: 0,
    12: 0,
}


class FreeFireScoringEngine:
    """
    Auto-Scoring Engine for Free Fire 12-team Battle Royale format.
    Handles placement point lookup, kill points, cumulative multi-match standings,
    rank delta calculation, and strict 4-tier tie-breakers.
    """

    def __init__(self):
        # team_id -> cumulative stats dictionary
        self.cumulative_standings: Dict[str, Dict[str, Any]] = {}
        self.match_history: List[List[Dict[str, Any]]] = []

    def compute_match_points(self, placement: int, kills: int) -> Tuple[int, int, int]:
        """
        Compute (placement_points, kill_points, total_points) for a single match result.
        """
        placement_pts = FREE_FIRE_PLACEMENT_POINTS.get(placement, 0)
        kill_pts = max(0, kills) * 1  # 1 point per kill
        total_pts = placement_pts + kill_pts
        return placement_pts, kill_pts, total_pts

    def record_match_result(
        self,
        match_index: int,
        results: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Process a list of 12 team results for a single match.
        Each item in `results`:
        {
            "team_id": str,
            "team_name": str,
            "team_short_code": str,
            "logo_url": str,
            "placement": int, (1..12)
            "kills": int
        }
        Returns the sorted cumulative standings after this match with rank deltas.
        """
        match_records = []
        for r in results:
            team_id = r["team_id"]
            placement = r["placement"]
            kills = r["kills"]
            p_pts, k_pts, tot_pts = self.compute_match_points(placement, kills)

            # Store match record
            record = {
                "match_index": match_index,
                "team_id": team_id,
                "team_name": r.get("team_name", team_id),
                "team_short_code": r.get("team_short_code", team_id[:3].upper()),
                "logo_url": r.get("logo_url", ""),
                "placement": placement,
                "kills": kills,
                "placement_points": p_pts,
                "kill_points": k_pts,
                "total_points": tot_pts,
            }
            match_records.append(record)

            # Snapshot previous rank for existing teams before updating
            if team_id not in self.cumulative_standings:
                self.cumulative_standings[team_id] = {
                    "team_id": team_id,
                    "team_name": record["team_name"],
                    "team_short_code": record["team_short_code"],
                    "logo_url": record["logo_url"],
                    "total_booyahs": 0,
                    "total_placement_points": 0,
                    "total_kill_points": 0,
                    "total_points": 0,
                    "previous_rank": 0,
                    "current_rank": 0,
                    "rank_change": 0,
                    "history": [],
                }
            else:
                entry = self.cumulative_standings[team_id]
                if entry.get("current_rank", 0) > 0:
                    entry["previous_rank"] = entry["current_rank"]

            entry = self.cumulative_standings[team_id]
            if placement == 1:
                entry["total_booyahs"] += 1
            entry["total_placement_points"] += p_pts
            entry["total_kill_points"] += k_pts
            entry["total_points"] += tot_pts
            entry["history"].append(record)

        self.match_history.append(match_records)

        # Recompute ranks and deltas on match commit only
        sorted_teams = sorted(self.cumulative_standings.values(), key=self._sort_key)
        for idx, team in enumerate(sorted_teams, start=1):
            if team.get("previous_rank", 0) == 0:
                team["previous_rank"] = idx  # First match baseline
            team["current_rank"] = idx
            team["rank_change"] = team["previous_rank"] - team["current_rank"]

        return sorted_teams

    def _sort_key(self, team: Dict[str, Any]):
        """
        Strict 4-Tier Tie-Breaker Sort Key:
        Tier 1: Total Points (descending)
        Tier 2: Total Booyahs (descending)
        Tier 3: Total Kill Points (descending)
        Tier 4: Full reverse history of match placements (ascending placement numbers)
        """
        history = team.get("history", [])
        reverse_placements = tuple(h.get("placement", 999) for h in reversed(history)) if history else (999,)
        return (
            -team["total_points"],
            -team["total_booyahs"],
            -team["total_kill_points"],
            reverse_placements,
        )

    def get_sorted_standings(self, current_match_index: int = 1) -> List[Dict[str, Any]]:
        """
        Idempotent query returning cumulative standings sorted by strict 4-Tier Tie-Breakers.
        Does NOT mutate previous_rank or rank_change on repeated calls.
        """
        return sorted(self.cumulative_standings.values(), key=self._sort_key)


class RoundRobinEngine:
    """
    Berger Round-Robin Pairing Engine (Feature 12).
    Generates standard Berger pairing schedules for even (N) and odd (N with rotating BYE) team counts.
    Calculates round-robin standings and head-to-head tie-breakers.
    """

    @staticmethod
    def generate_berger_table(
        teams: List[TournamentTeam],
    ) -> List[List[Tuple[Optional[TournamentTeam], Optional[TournamentTeam]]]]:
        """
        Generate standard Berger Round-Robin pairings table.
        For N teams (or N+1 if odd, with rotating None BYE).
        Returns a list of rounds, each round containing (team_a, team_b) pairings.
        """
        n = len(teams)
        if n < 2:
            return []

        team_list: List[Optional[TournamentTeam]] = list(teams)
        is_odd = (n % 2 != 0)
        if is_odd:
            team_list.append(None)  # BYE placeholder

        total_teams = len(team_list)
        num_rounds = total_teams - 1
        half = total_teams // 2
        schedule = []

        curr = list(team_list)
        for r in range(num_rounds):
            round_pairings: List[Tuple[Optional[TournamentTeam], Optional[TournamentTeam]]] = []
            for i in range(half):
                t1 = curr[i]
                t2 = curr[total_teams - 1 - i]
                # Alternate home/away for balance
                if r % 2 == 1 and i == 0:
                    round_pairings.append((t2, t1))
                else:
                    round_pairings.append((t1, t2))
            schedule.append(round_pairings)
            # Berger rotation: keep index 0 fixed, rotate others clockwise
            curr = [curr[0]] + [curr[-1]] + curr[1:-1]

        return schedule

    @staticmethod
    def compute_standings(
        teams: List[TournamentTeam],
        match_results: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Compute Round-Robin standings table: Wins, Losses, Ties, Points, Head-to-Head.
        """
        table: Dict[str, Dict[str, Any]] = {}
        for t in teams:
            table[t.team_id] = {
                "team_id": t.team_id,
                "team_name": t.name,
                "played": 0,
                "wins": 0,
                "losses": 0,
                "ties": 0,
                "points": 0,
                "head_to_head": {},
            }

        for m in match_results:
            team_a_id = m.get("team_a_id")
            team_b_id = m.get("team_b_id")
            if not team_a_id or not team_b_id or team_a_id not in table or team_b_id not in table:
                continue

            score_a = m.get("score_a", 0)
            score_b = m.get("score_b", 0)
            table[team_a_id]["played"] += 1
            table[team_b_id]["played"] += 1

            if score_a > score_b:
                table[team_a_id]["wins"] += 1
                table[team_a_id]["points"] += 3
                table[team_b_id]["losses"] += 1
                table[team_a_id]["head_to_head"][team_b_id] = True
                table[team_b_id]["head_to_head"][team_a_id] = False
            elif score_b > score_a:
                table[team_b_id]["wins"] += 1
                table[team_b_id]["points"] += 3
                table[team_a_id]["losses"] += 1
                table[team_b_id]["head_to_head"][team_a_id] = True
                table[team_a_id]["head_to_head"][team_b_id] = False
            else:
                table[team_a_id]["ties"] += 1
                table[team_b_id]["ties"] += 1
                table[team_a_id]["points"] += 1
                table[team_b_id]["points"] += 1

        def rr_sort_key(entry: Dict[str, Any]):
            return (-entry["points"], -entry["wins"], entry["losses"])

        sorted_table = sorted(table.values(), key=rr_sort_key)
        for idx, entry in enumerate(sorted_table, start=1):
            entry["rank"] = idx

        return sorted_table


# Alias BergerRoundRobinEngine for explicit naming
BergerRoundRobinEngine = RoundRobinEngine


class BracketEngine:
    """
    DAG Bracket Engine managing Single and Double Elimination formats,
    Round-Robin Berger schedules, BO1/BO3/BO5 progression, and Losers bracket drop-down routing.
    """

    @staticmethod
    def generate_berger_table(
        teams: List[TournamentTeam],
    ) -> List[List[Tuple[Optional[TournamentTeam], Optional[TournamentTeam]]]]:
        """Generate standard Berger Round-Robin pairings table."""
        return RoundRobinEngine.generate_berger_table(teams)

    @staticmethod
    def create_round_robin_bracket(
        tournament_id: str,
        name: str,
        game_id: SupportedGameId,
        teams: List[TournamentTeam],
        bo_format: int = 1,
    ) -> Tournament:
        """Create a Round-Robin tournament structure from Berger pairing schedules."""
        tournament = Tournament(
            tournament_id=tournament_id,
            name=name,
            game_id=game_id,
            format=BracketFormat.ROUND_ROBIN,
            teams=teams,
        )
        rounds = RoundRobinEngine.generate_berger_table(teams)
        nodes: Dict[str, BracketNode] = {}
        first_match_id = None

        for r_idx, round_pairings in enumerate(rounds, start=1):
            for m_idx, (ta, tb) in enumerate(round_pairings, start=1):
                m_id = f"{tournament_id}_R{r_idx}_M{m_idx}"
                if first_match_id is None and ta is not None and tb is not None:
                    first_match_id = m_id
                node = BracketNode(
                    match_id=m_id,
                    round_name=f"Round {r_idx} Match {m_idx}",
                    stage="ROUND_ROBIN",
                    team_a=ta,
                    team_b=tb,
                    bo_format=bo_format,
                )
                if ta is None or tb is None:
                    node.is_complete = True
                    node.winner = ta if ta is not None else tb
                nodes[m_id] = node

        tournament.nodes = nodes
        tournament.current_match_id = first_match_id
        return tournament

    @staticmethod
    def create_single_elimination_bracket(
        tournament_id: str,
        name: str,
        game_id: SupportedGameId,
        teams: List[TournamentTeam],
        bo_format: int = 3,
    ) -> Tournament:
        """
        Build a Single Elimination DAG tournament tree.
        Supports 2, 3, 4, 5, 6, 7, 8, 16 teams with automatic BYE assignment.
        """
        tournament = Tournament(
            tournament_id=tournament_id,
            name=name,
            game_id=game_id,
            format=BracketFormat.SINGLE_ELIMINATION,
            teams=teams,
        )

        n = len(teams)
        if n < 2:
            return tournament

        nodes: Dict[str, BracketNode] = {}

        if n == 2:
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="UPPER",
                team_a=teams[0],
                team_b=teams[1],
                bo_format=bo_format,
            )
            nodes[gf.match_id] = gf
            tournament.current_match_id = gf.match_id

        elif n == 3:
            # Seed 1 gets a BYE to GF. Seed 2 vs Seed 3 play Semifinal. Total = 2 matches.
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="UPPER",
                team_a=teams[0],
                bo_format=bo_format,
            )
            sf1 = BracketNode(
                match_id=f"{tournament_id}_SF1",
                round_name="Semifinal 1",
                stage="UPPER",
                team_a=teams[1],
                team_b=teams[2],
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="B",
            )
            nodes[sf1.match_id] = sf1
            nodes[gf.match_id] = gf
            tournament.current_match_id = sf1.match_id

        elif n == 4:
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="UPPER",
                bo_format=bo_format,
            )
            sf1 = BracketNode(
                match_id=f"{tournament_id}_SF1",
                round_name="Semifinal 1",
                stage="UPPER",
                team_a=teams[0],
                team_b=teams[3],
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="A",
            )
            sf2 = BracketNode(
                match_id=f"{tournament_id}_SF2",
                round_name="Semifinal 2",
                stage="UPPER",
                team_a=teams[1],
                team_b=teams[2],
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="B",
            )
            nodes[sf1.match_id] = sf1
            nodes[sf2.match_id] = sf2
            nodes[gf.match_id] = gf
            tournament.current_match_id = sf1.match_id

        elif 5 <= n <= 7:
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="UPPER",
                bo_format=bo_format,
            )
            sf1 = BracketNode(
                match_id=f"{tournament_id}_SF1",
                round_name="Semifinal 1",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="A",
            )
            sf2 = BracketNode(
                match_id=f"{tournament_id}_SF2",
                round_name="Semifinal 2",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="B",
            )
            if n == 5:
                # Seeds 1, 2, 3 get BYEs. Seed 4 vs Seed 5 play QF1. Total = 4 matches.
                sf1.team_a = teams[0]
                sf2.team_a = teams[1]
                sf2.team_b = teams[2]
                qf1 = BracketNode(
                    match_id=f"{tournament_id}_QF1",
                    round_name="Quarterfinal 1",
                    stage="UPPER",
                    team_a=teams[3],
                    team_b=teams[4],
                    bo_format=bo_format,
                    next_match_id=sf1.match_id,
                    next_slot="B",
                )
                nodes[qf1.match_id] = qf1
                nodes[sf1.match_id] = sf1
                nodes[sf2.match_id] = sf2
                nodes[gf.match_id] = gf
                tournament.current_match_id = qf1.match_id
            elif n == 6:
                sf1.team_a = teams[0]
                sf2.team_a = teams[1]
                qf1 = BracketNode(
                    match_id=f"{tournament_id}_QF1",
                    round_name="Quarterfinal 1",
                    stage="UPPER",
                    team_a=teams[3],
                    team_b=teams[4],
                    bo_format=bo_format,
                    next_match_id=sf1.match_id,
                    next_slot="B",
                )
                qf2 = BracketNode(
                    match_id=f"{tournament_id}_QF2",
                    round_name="Quarterfinal 2",
                    stage="UPPER",
                    team_a=teams[2],
                    team_b=teams[5],
                    bo_format=bo_format,
                    next_match_id=sf2.match_id,
                    next_slot="B",
                )
                for node in [qf1, qf2, sf1, sf2, gf]:
                    nodes[node.match_id] = node
                tournament.current_match_id = qf1.match_id
            elif n == 7:
                sf1.team_a = teams[0]
                qf1 = BracketNode(
                    match_id=f"{tournament_id}_QF1",
                    round_name="Quarterfinal 1",
                    stage="UPPER",
                    team_a=teams[3],
                    team_b=teams[4],
                    bo_format=bo_format,
                    next_match_id=sf1.match_id,
                    next_slot="B",
                )
                qf2 = BracketNode(
                    match_id=f"{tournament_id}_QF2",
                    round_name="Quarterfinal 2",
                    stage="UPPER",
                    team_a=teams[1],
                    team_b=teams[6],
                    bo_format=bo_format,
                    next_match_id=sf2.match_id,
                    next_slot="A",
                )
                qf3 = BracketNode(
                    match_id=f"{tournament_id}_QF3",
                    round_name="Quarterfinal 3",
                    stage="UPPER",
                    team_a=teams[2],
                    team_b=teams[5],
                    bo_format=bo_format,
                    next_match_id=sf2.match_id,
                    next_slot="B",
                )
                for node in [qf1, qf2, qf3, sf1, sf2, gf]:
                    nodes[node.match_id] = node
                tournament.current_match_id = qf1.match_id

        elif 8 <= n <= 15:
            # 8-team bracket: 4 QF + 2 SF + 1 GF = 7 matches
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="UPPER",
                bo_format=bo_format,
            )
            sf1 = BracketNode(
                match_id=f"{tournament_id}_SF1",
                round_name="Semifinal 1",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="A",
            )
            sf2 = BracketNode(
                match_id=f"{tournament_id}_SF2",
                round_name="Semifinal 2",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="B",
            )
            qf1 = BracketNode(
                match_id=f"{tournament_id}_QF1",
                round_name="Quarterfinal 1",
                stage="UPPER",
                team_a=teams[0],
                team_b=teams[7] if n > 7 else None,
                bo_format=bo_format,
                next_match_id=sf1.match_id,
                next_slot="A",
            )
            qf2 = BracketNode(
                match_id=f"{tournament_id}_QF2",
                round_name="Quarterfinal 2",
                stage="UPPER",
                team_a=teams[3] if n > 3 else None,
                team_b=teams[4] if n > 4 else None,
                bo_format=bo_format,
                next_match_id=sf1.match_id,
                next_slot="B",
            )
            qf3 = BracketNode(
                match_id=f"{tournament_id}_QF3",
                round_name="Quarterfinal 3",
                stage="UPPER",
                team_a=teams[1] if n > 1 else None,
                team_b=teams[6] if n > 6 else None,
                bo_format=bo_format,
                next_match_id=sf2.match_id,
                next_slot="A",
            )
            qf4 = BracketNode(
                match_id=f"{tournament_id}_QF4",
                round_name="Quarterfinal 4",
                stage="UPPER",
                team_a=teams[2] if n > 2 else None,
                team_b=teams[5] if n > 5 else None,
                bo_format=bo_format,
                next_match_id=sf2.match_id,
                next_slot="B",
            )
            for node in [qf1, qf2, qf3, qf4, sf1, sf2, gf]:
                nodes[node.match_id] = node
            tournament.current_match_id = qf1.match_id

        elif n >= 16:
            # 16-team power-of-2 tree: 8 R16 + 4 QF + 2 SF + 1 GF = 15 matches
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="UPPER",
                bo_format=bo_format,
            )
            sf1 = BracketNode(
                match_id=f"{tournament_id}_SF1",
                round_name="Semifinal 1",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="A",
            )
            sf2 = BracketNode(
                match_id=f"{tournament_id}_SF2",
                round_name="Semifinal 2",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="B",
            )
            qf1 = BracketNode(
                match_id=f"{tournament_id}_QF1",
                round_name="Quarterfinal 1",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=sf1.match_id,
                next_slot="A",
            )
            qf2 = BracketNode(
                match_id=f"{tournament_id}_QF2",
                round_name="Quarterfinal 2",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=sf1.match_id,
                next_slot="B",
            )
            qf3 = BracketNode(
                match_id=f"{tournament_id}_QF3",
                round_name="Quarterfinal 3",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=sf2.match_id,
                next_slot="A",
            )
            qf4 = BracketNode(
                match_id=f"{tournament_id}_QF4",
                round_name="Quarterfinal 4",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=sf2.match_id,
                next_slot="B",
            )

            r16_pairings = [
                (0, 15, qf1, "A"),
                (7, 8, qf1, "B"),
                (3, 12, qf2, "A"),
                (4, 11, qf2, "B"),
                (1, 14, qf3, "A"),
                (6, 9, qf3, "B"),
                (2, 13, qf4, "A"),
                (5, 10, qf4, "B"),
            ]
            r16_nodes = []
            for idx, (s1, s2, next_node, slot) in enumerate(r16_pairings, start=1):
                r16_m = BracketNode(
                    match_id=f"{tournament_id}_R16_{idx}",
                    round_name=f"Round of 16 Match {idx}",
                    stage="UPPER",
                    team_a=teams[s1] if s1 < n else None,
                    team_b=teams[s2] if s2 < n else None,
                    bo_format=bo_format,
                    next_match_id=next_node.match_id,
                    next_slot=slot,
                )
                r16_nodes.append(r16_m)

            for node in r16_nodes + [qf1, qf2, qf3, qf4, sf1, sf2, gf]:
                nodes[node.match_id] = node
            tournament.current_match_id = r16_nodes[0].match_id

        tournament.nodes = nodes
        return tournament

    @staticmethod
    def create_double_elimination_bracket(
        tournament_id: str,
        name: str,
        game_id: SupportedGameId,
        teams: List[TournamentTeam],
        bo_format: int = 3,
        enable_bracket_reset: bool = True,
    ) -> Tournament:
        """
        Build a Double Elimination tournament tree with Losers Bracket cross-routing,
        BYE auto-progression for odd counts, and optional Grand Finals Bracket Reset toggle.
        Supports 3, 4, 8 teams.
        """
        tournament = Tournament(
            tournament_id=tournament_id,
            name=name,
            game_id=game_id,
            format=BracketFormat.DOUBLE_ELIMINATION,
            teams=teams,
            enable_bracket_reset=enable_bracket_reset,
        )
        nodes: Dict[str, BracketNode] = {}
        n = len(teams)

        if n <= 4:
            gf_reset = BracketNode(
                match_id=f"{tournament_id}_GF_RESET",
                round_name="Grand Final Reset",
                stage="GRAND_FINAL",
                bo_format=bo_format,
                bracket_reset=True,
            )
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="GRAND_FINAL",
                bo_format=bo_format,
                next_match_id=gf_reset.match_id,
            )
            ub_final = BracketNode(
                match_id=f"{tournament_id}_UB_FINAL",
                round_name="Upper Bracket Final",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="A",
                loser_next_match_id=f"{tournament_id}_LB_FINAL",
                loser_next_slot="A",
            )
            lb_final = BracketNode(
                match_id=f"{tournament_id}_LB_FINAL",
                round_name="Lower Bracket Final",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="B",
            )
            lb_r1 = BracketNode(
                match_id=f"{tournament_id}_LB_R1",
                round_name="Lower Bracket Round 1",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=lb_final.match_id,
                next_slot="B",
            )
            ub_sf1 = BracketNode(
                match_id=f"{tournament_id}_UB_SF1",
                round_name="Upper Bracket Semifinal 1",
                stage="UPPER",
                team_a=teams[0] if n > 0 else None,
                team_b=teams[3] if n > 3 else None,
                bo_format=bo_format,
                next_match_id=ub_final.match_id,
                next_slot="A",
                loser_next_match_id=lb_r1.match_id,
                loser_next_slot="A",
            )
            ub_sf2 = BracketNode(
                match_id=f"{tournament_id}_UB_SF2",
                round_name="Upper Bracket Semifinal 2",
                stage="UPPER",
                team_a=teams[1] if n > 1 else None,
                team_b=teams[2] if n > 2 else None,
                bo_format=bo_format,
                next_match_id=ub_final.match_id,
                next_slot="B",
                loser_next_match_id=lb_r1.match_id,
                loser_next_slot="B",
            )

            # Odd team count (n=3): auto-complete UB_SF1 as a BYE to avoid deadlock
            if ub_sf1.team_b is None and ub_sf1.team_a is not None:
                ub_sf1.is_complete = True
                ub_sf1.winner = ub_sf1.team_a
                ub_sf1.score_a = math.ceil(bo_format / 2)
                ub_final.team_a = ub_sf1.team_a
                tournament.current_match_id = ub_sf2.match_id
            else:
                tournament.current_match_id = ub_sf1.match_id

            node_list = [ub_sf1, ub_sf2, ub_final, lb_r1, lb_final, gf]
            if enable_bracket_reset:
                node_list.append(gf_reset)

            for item in node_list:
                nodes[item.match_id] = item

        else:
            # 8-Team Double Elimination tree (>= 14 matches)
            gf_reset = BracketNode(
                match_id=f"{tournament_id}_GF_RESET",
                round_name="Grand Final Reset",
                stage="GRAND_FINAL",
                bo_format=bo_format,
                bracket_reset=True,
            )
            gf = BracketNode(
                match_id=f"{tournament_id}_GF",
                round_name="Grand Final",
                stage="GRAND_FINAL",
                bo_format=bo_format,
                next_match_id=gf_reset.match_id,
            )
            lb_final = BracketNode(
                match_id=f"{tournament_id}_LB_FINAL",
                round_name="Lower Bracket Final",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="B",
            )
            ub_final = BracketNode(
                match_id=f"{tournament_id}_UB_FINAL",
                round_name="Upper Bracket Final",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=gf.match_id,
                next_slot="A",
                loser_next_match_id=lb_final.match_id,
                loser_next_slot="A",
            )
            lb_r3 = BracketNode(
                match_id=f"{tournament_id}_LB_R3",
                round_name="Lower Bracket Round 3",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=lb_final.match_id,
                next_slot="B",
            )
            lb_r2_1 = BracketNode(
                match_id=f"{tournament_id}_LB_R2_1",
                round_name="Lower Bracket Round 2 Match 1",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=lb_r3.match_id,
                next_slot="A",
            )
            lb_r2_2 = BracketNode(
                match_id=f"{tournament_id}_LB_R2_2",
                round_name="Lower Bracket Round 2 Match 2",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=lb_r3.match_id,
                next_slot="B",
            )
            ub_sf1 = BracketNode(
                match_id=f"{tournament_id}_UB_SF1",
                round_name="Upper Bracket Semifinal 1",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=ub_final.match_id,
                next_slot="A",
                loser_next_match_id=lb_r2_1.match_id,
                loser_next_slot="A",
            )
            ub_sf2 = BracketNode(
                match_id=f"{tournament_id}_UB_SF2",
                round_name="Upper Bracket Semifinal 2",
                stage="UPPER",
                bo_format=bo_format,
                next_match_id=ub_final.match_id,
                next_slot="B",
                loser_next_match_id=lb_r2_2.match_id,
                loser_next_slot="A",
            )
            lb_r1_1 = BracketNode(
                match_id=f"{tournament_id}_LB_R1_1",
                round_name="Lower Bracket Round 1 Match 1",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=lb_r2_2.match_id,
                next_slot="B",
            )
            lb_r1_2 = BracketNode(
                match_id=f"{tournament_id}_LB_R1_2",
                round_name="Lower Bracket Round 1 Match 2",
                stage="LOWER",
                bo_format=bo_format,
                next_match_id=lb_r2_1.match_id,
                next_slot="B",
            )
            ub_qf1 = BracketNode(
                match_id=f"{tournament_id}_UB_QF1",
                round_name="Upper Bracket Quarterfinal 1",
                stage="UPPER",
                team_a=teams[0],
                team_b=teams[7] if n > 7 else None,
                bo_format=bo_format,
                next_match_id=ub_sf1.match_id,
                next_slot="A",
                loser_next_match_id=lb_r1_1.match_id,
                loser_next_slot="A",
            )
            ub_qf2 = BracketNode(
                match_id=f"{tournament_id}_UB_QF2",
                round_name="Upper Bracket Quarterfinal 2",
                stage="UPPER",
                team_a=teams[3] if n > 3 else None,
                team_b=teams[4] if n > 4 else None,
                bo_format=bo_format,
                next_match_id=ub_sf1.match_id,
                next_slot="B",
                loser_next_match_id=lb_r1_1.match_id,
                loser_next_slot="B",
            )
            ub_qf3 = BracketNode(
                match_id=f"{tournament_id}_UB_QF3",
                round_name="Upper Bracket Quarterfinal 3",
                stage="UPPER",
                team_a=teams[1] if n > 1 else None,
                team_b=teams[6] if n > 6 else None,
                bo_format=bo_format,
                next_match_id=ub_sf2.match_id,
                next_slot="A",
                loser_next_match_id=lb_r1_2.match_id,
                loser_next_slot="A",
            )
            ub_qf4 = BracketNode(
                match_id=f"{tournament_id}_UB_QF4",
                round_name="Upper Bracket Quarterfinal 4",
                stage="UPPER",
                team_a=teams[2] if n > 2 else None,
                team_b=teams[5] if n > 5 else None,
                bo_format=bo_format,
                next_match_id=ub_sf2.match_id,
                next_slot="B",
                loser_next_match_id=lb_r1_2.match_id,
                loser_next_slot="B",
            )

            # Auto-complete BYE nodes if team_b is None
            for qf_node in [ub_qf1, ub_qf2, ub_qf3, ub_qf4]:
                if qf_node.team_b is None and qf_node.team_a is not None:
                    qf_node.is_complete = True
                    qf_node.winner = qf_node.team_a
                    qf_node.score_a = math.ceil(bo_format / 2)
                    if qf_node.next_match_id:
                        next_n = ub_sf1 if qf_node.next_match_id == ub_sf1.match_id else ub_sf2
                        if qf_node.next_slot == "A":
                            next_n.team_a = qf_node.winner
                        else:
                            next_n.team_b = qf_node.winner

            node_list = [
                ub_qf1, ub_qf2, ub_qf3, ub_qf4,
                lb_r1_1, lb_r1_2,
                ub_sf1, ub_sf2,
                lb_r2_1, lb_r2_2,
                ub_final, lb_r3, lb_final,
                gf, gf_reset,
            ]
            for item in node_list:
                nodes[item.match_id] = item
            tournament.current_match_id = ub_qf1.match_id

        tournament.nodes = nodes
        return tournament

    @staticmethod
    def record_match_game(
        tournament: Tournament,
        match_id: str,
        winner_side: str,  # 'A' or 'B'
    ) -> BracketNode:
        """
        Record a single game win in a BO series for match_id.
        Advances winner to next match if win threshold (ceil(bo_format / 2)) is met.
        Routes loser to losers bracket if applicable.
        Handles Grand Finals bracket reset if Lower Bracket winner defeats Upper Bracket champion.
        """
        if match_id not in tournament.nodes:
            raise KeyError(f"Match {match_id} not found in tournament")

        node = tournament.nodes[match_id]
        if node.is_complete:
            return node

        win_threshold = math.ceil(node.bo_format / 2)

        if winner_side.upper() == "A":
            node.score_a += 1
        elif winner_side.upper() == "B":
            node.score_b += 1
        else:
            raise ValueError(f"Invalid winner_side '{winner_side}', must be 'A' or 'B'")

        # Check if series completed
        if node.score_a >= win_threshold:
            node.is_complete = True
            node.winner = node.team_a
            node.loser = node.team_b
        elif node.score_b >= win_threshold:
            node.is_complete = True
            node.winner = node.team_b
            node.loser = node.team_a

        if node.is_complete:
            # Check for Grand Final Bracket Reset
            if match_id.endswith("_GF"):
                if getattr(tournament, "enable_bracket_reset", True) and getattr(tournament, "format", None) == BracketFormat.DOUBLE_ELIMINATION:
                    # If Lower Bracket winner (slot B) beats Upper Bracket winner (slot A)
                    if node.winner == node.team_b:
                        reset_id = f"{tournament.tournament_id}_GF_RESET"
                        if reset_id in tournament.nodes:
                            reset_node = tournament.nodes[reset_id]
                            reset_node.team_a = node.team_a
                            reset_node.team_b = node.team_b
                            tournament.current_match_id = reset_id
                            return node
                    else:
                        tournament.champion = node.winner
                        reset_id = f"{tournament.tournament_id}_GF_RESET"
                        if reset_id in tournament.nodes:
                            tournament.nodes[reset_id].is_complete = True
                            tournament.nodes[reset_id].winner = node.winner
                else:
                    tournament.champion = node.winner
            elif match_id.endswith("_GF_RESET"):
                tournament.champion = node.winner

            # Advance winner
            if node.next_match_id and node.next_match_id in tournament.nodes:
                next_node = tournament.nodes[node.next_match_id]
                if node.next_slot == "A":
                    next_node.team_a = node.winner
                else:
                    next_node.team_b = node.winner

            # Route loser (for Double Elimination)
            if node.loser_next_match_id and node.loser_next_match_id in tournament.nodes:
                loser_node = tournament.nodes[node.loser_next_match_id]
                if node.loser_next_slot == "A":
                    loser_node.team_a = node.loser
                else:
                    loser_node.team_b = node.loser

        return node


class AssetPreloader:
    """
    Dynamic Asset Pre-loader (<50ms GPU Texture simulation).
    Caches team logos, roster photos, and injects default silhouettes for missing assets.
    """

    DEFAULT_SILHOUETTE = "/assets/fallback_silhouette.png"

    def __init__(self):
        # Simulated GPU texture cache
        self.gpu_texture_cache: Dict[str, Dict[str, Any]] = {}

    def preload_match_assets(
        self,
        tournament: Tournament,
        match_id: str,
    ) -> Dict[str, Any]:
        """
        Pre-load team logos and player avatars for the specified match node.
        Returns a dictionary of texture metadata.
        SLA: Must execute within < 50ms.
        """
        start_time = time.perf_counter()

        if match_id not in tournament.nodes:
            raise KeyError(f"Match {match_id} not found in tournament")

        node = tournament.nodes[match_id]
        loaded_textures = {
            "match_id": match_id,
            "teams": {},
            "load_time_ms": 0.0,
        }

        for side, team in [("team_a", node.team_a), ("team_b", node.team_b)]:
            if team is None:
                continue

            # Verify or inject logo
            logo = team.logo_url if team.logo_url else f"/assets/{team.short_code.lower()}_logo.png"
            team_entry = {
                "team_id": team.team_id,
                "name": team.name,
                "short_code": team.short_code,
                "logo_texture_handle": f"TEX_LOGO_{team.team_id}",
                "logo_url": logo,
                "color_primary": team.theme_color_primary,
                "roster": [],
            }

            for p in team.roster:
                avatar = p.avatar_url if p.avatar_url else self.DEFAULT_SILHOUETTE
                is_fallback = avatar == self.DEFAULT_SILHOUETTE
                p_entry = {
                    "player_id": p.player_id,
                    "gamertag": p.gamertag,
                    "avatar_texture_handle": f"TEX_AVATAR_{p.player_id}",
                    "avatar_url": avatar,
                    "is_fallback_silhouette": is_fallback,
                }
                team_entry["roster"].append(p_entry)
                self.gpu_texture_cache[p_entry["avatar_texture_handle"]] = p_entry

            self.gpu_texture_cache[team_entry["logo_texture_handle"]] = team_entry
            loaded_textures["teams"][side] = team_entry

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        loaded_textures["load_time_ms"] = elapsed_ms
        return loaded_textures
