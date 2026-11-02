"""
Esports Tournament Livestream Application - Verification & Simulation Package.

This package provides normalized telemetry data models, a multi-game real-time simulator,
a tournament progression and scoring engine, a dual-canvas scene router, an ingress
telemetry gateway with connection health monitoring, and an end-to-end verification test suite.
"""

from verification.gateway import TelemetryGateway

__version__ = "1.0.0"
__all__ = [
    "models",
    "simulator",
    "tournament_engine",
    "scene_router",
    "gateway",
    "TelemetryGateway",
]
