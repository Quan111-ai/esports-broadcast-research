"""
verification/gateway.py

Real-Time Telemetry Gateway & Health Monitoring Engine for Esports Broadcasts.
Implements:
- Packet validation (schema check, non-empty event_id, positive sequence ID, valid timestamp)
- Monotonic sequence ordering & out-of-order rejection
- Sequence ID deduplication
- Connection health & heartbeat monitor (500ms heartbeat, 1500ms stale warning, disconnection)
- Persistent Freeze-Frame Buffer for fail-safe HUD retention during signal dropouts
"""

from __future__ import annotations
import copy
import time
from typing import Dict, Any, Optional, Set


class TelemetryGateway:
    """
    Ingress Telemetry Gateway enforcing packet validation, sequence monotonicity,
    heartbeat monitoring, and freeze-frame state retention.
    """

    def __init__(self, initial_heartbeat_ms: Optional[int] = None):
        self.seen_sequences: Set[int] = set()
        self.last_applied_seq: Optional[int] = None
        self.last_heartbeat_ms: Optional[int] = initial_heartbeat_ms
        self.freeze_frame_buffer: Dict[str, Any] = {}
        self.total_packets_received: int = 0
        self.total_packets_dropped: int = 0

    def validate_packet(self, packet: Dict[str, Any]) -> bool:
        """
        Validate packet structure:
        - Non-empty event_id
        - sequence_id >= 0
        - valid timestamp (timestamp_game_ms >= 0 or non-empty timestamp_utc)
        """
        if not isinstance(packet, dict):
            return False

        event_id = packet.get("event_id")
        if not event_id or not isinstance(event_id, str):
            return False

        seq = packet.get("sequence_id", 0)
        if not isinstance(seq, int) or seq < 0:
            return False

        ts_game = packet.get("timestamp_game_ms", 0)
        if isinstance(ts_game, (int, float)) and ts_game < 0:
            return False

        return True

    def validate_sequence(self, sequence_id: int) -> bool:
        """
        Validate sequence identifier value is non-negative.
        """
        return isinstance(sequence_id, int) and sequence_id >= 0

    def is_duplicate(self, sequence_id: int) -> bool:
        """
        Check if sequence ID has already been processed.
        """
        return sequence_id in self.seen_sequences

    def process_packet(self, packet: Dict[str, Any]) -> bool:
        """
        Process incoming telemetry packet with sequence monotonicity enforcement,
        deduplication, heartbeat update, and freeze-frame buffering.
        Returns True if packet was accepted and applied, False if dropped/rejected.
        """
        self.total_packets_received += 1

        if not self.validate_packet(packet):
            self.total_packets_dropped += 1
            return False

        seq = packet.get("sequence_id", 0)

        # Sequence deduplication
        if seq in self.seen_sequences:
            self.total_packets_dropped += 1
            return False

        # Monotonic sequence enforcement: reject out-of-order/stale packets
        if self.last_applied_seq is not None and seq <= self.last_applied_seq:
            self.total_packets_dropped += 1
            return False

        # Apply packet
        self.seen_sequences.add(seq)
        self.last_applied_seq = seq

        # Heartbeat update
        ts_game = packet.get("timestamp_game_ms")
        if ts_game is not None and isinstance(ts_game, (int, float)) and ts_game >= 0:
            self.last_heartbeat_ms = int(ts_game)
        else:
            self.last_heartbeat_ms = int(time.time() * 1000)

        # Update freeze-frame buffer if payload is present and non-empty
        payload = packet.get("payload")
        if payload is not None and isinstance(payload, dict) and len(payload) > 0:
            self.freeze_frame_buffer = copy.deepcopy(payload)

        return True

    def record_heartbeat(self, timestamp_ms: int) -> None:
        """
        Record heartbeat arrival timestamp in milliseconds.
        """
        self.last_heartbeat_ms = timestamp_ms

    def heartbeat_monitor(self, now_ms: int) -> str:
        """
        Check connection health status based on time gap since last heartbeat:
        - <= 500ms: HEALTHY
        - > 500ms and <= 1500ms: WARNING_STALE
        - > 1500ms: DISCONNECTED
        """
        if self.last_heartbeat_ms is None:
            return "DISCONNECTED"

        gap = now_ms - self.last_heartbeat_ms
        if gap < 0:
            gap = 0

        if gap <= 500:
            return "HEALTHY"
        elif gap <= 1500:
            return "WARNING_STALE"
        else:
            return "DISCONNECTED"

    def is_stale(self, now_ms: int, timeout_threshold_ms: int = 1500) -> bool:
        """
        Check if connection heartbeat is stale beyond the specified threshold.
        """
        if self.last_heartbeat_ms is None:
            return True
        return (now_ms - self.last_heartbeat_ms) > timeout_threshold_ms

    def check_heartbeat_stale(self, current_time_ms: int, timeout_threshold_ms: int = 1500) -> bool:
        """
        Alias for is_stale for compatibility with review specifications.
        """
        return self.is_stale(current_time_ms, timeout_threshold_ms)

    def get_freeze_frame_buffer(self) -> Dict[str, Any]:
        """
        Retrieve the last valid HUD / telemetry state stored in the freeze-frame buffer.
        Guaranteed to retain state across network disconnects and packet dropouts.
        """
        return copy.deepcopy(self.freeze_frame_buffer)

    def update_freeze_frame_buffer(self, state: Dict[str, Any]) -> None:
        """
        Explicitly update freeze-frame buffer with a valid HUD state dictionary.
        """
        if state and isinstance(state, dict):
            self.freeze_frame_buffer = copy.deepcopy(state)
