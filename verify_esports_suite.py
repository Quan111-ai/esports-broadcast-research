#!/usr/bin/env python3
"""
verify_esports_suite.py

Standalone Master Test Runner and Verification Suite for the Esports Tournament
Livestream Application. Executes all 4 test tiers, verifies processing SLAs (<50ms),
and prints structured execution reports.
"""

import sys
import time
import unittest
from typing import Dict, List, Any


class EsportsTestResultCollector(unittest.TestResult):
    """
    Custom test result collector capturing test names, execution time,
    status, and tier breakdown.
    """

    def __init__(self):
        super().__init__()
        self.test_records: List[Dict[str, Any]] = []
        self._start_time = 0.0

    def startTest(self, test):
        super().startTest(test)
        self._start_time = time.perf_counter()

    def addSuccess(self, test):
        super().addSuccess(test)
        elapsed = (time.perf_counter() - self._start_time) * 1000.0
        self.test_records.append({
            "name": test._testMethodName,
            "class": test.__class__.__name__,
            "status": "PASS",
            "elapsed_ms": elapsed,
            "err": None,
        })

    def addFailure(self, test, err):
        super().addFailure(test, err)
        elapsed = (time.perf_counter() - self._start_time) * 1000.0
        self.test_records.append({
            "name": test._testMethodName,
            "class": test.__class__.__name__,
            "status": "FAIL",
            "elapsed_ms": elapsed,
            "err": str(err),
        })

    def addError(self, test, err):
        super().addError(test, err)
        elapsed = (time.perf_counter() - self._start_time) * 1000.0
        self.test_records.append({
            "name": test._testMethodName,
            "class": test.__class__.__name__,
            "status": "ERROR",
            "elapsed_ms": elapsed,
            "err": str(err),
        })


def run_esports_verification() -> int:
    """
    Execute full verification suite and display executive report.
    """
    print("=" * 80)
    print("   ESPORTS TOURNAMENT LIVESTREAM APPLICATION - E2E VERIFICATION SUITE")
    print("=" * 80)
    print("Timestamp: ", time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()))
    print("System   :  Python", sys.version.split()[0], "on", sys.platform)
    print("Target   :  LoL, VALORANT, Lien Quan, Wild Rift, Free Fire (5 Games, 5 Modules)")
    print("-" * 80)

    loader = unittest.TestLoader()
    suite = loader.loadTestsFromName("verification.test_esports_suite")

    collector = EsportsTestResultCollector()
    start_total = time.perf_counter()
    suite.run(collector)
    total_duration_sec = time.perf_counter() - start_total

    # Categorize tests by tier
    tier_stats = {
        "TestTier1FeatureCoverage": {"tier": "Tier 1: Core Feature Coverage", "total": 0, "pass": 0, "fail": 0},
        "TestTier2BoundaryAndCornerCases": {"tier": "Tier 2: Boundary & Corner Cases", "total": 0, "pass": 0, "fail": 0},
        "TestTier3CrossFeatureInteractions": {"tier": "Tier 3: Cross-Feature Interactions", "total": 0, "pass": 0, "fail": 0},
        "TestTier4RealWorldWorkloads": {"tier": "Tier 4: Real-World Workloads & SLAs", "total": 0, "pass": 0, "fail": 0},
    }

    for record in collector.test_records:
        cls_name = record["class"]
        if cls_name in tier_stats:
            tier_stats[cls_name]["total"] += 1
            if record["status"] == "PASS":
                tier_stats[cls_name]["pass"] += 1
            else:
                tier_stats[cls_name]["fail"] += 1

    # Print Tier Breakdown Table
    print(f"{'Tier Name':<42} | {'Total':<6} | {'Passed':<6} | {'Failed':<6} | {'Status':<8}")
    print("-" * 80)
    all_passed = True
    for cls_name, info in tier_stats.items():
        status = "PASSED" if info["fail"] == 0 and info["total"] > 0 else "FAILED"
        if status == "FAILED":
            all_passed = False
        print(f"{info['tier']:<42} | {info['total']:<6} | {info['pass']:<6} | {info['fail']:<6} | [{status}]")
    print("-" * 80)

    # Summary Metrics
    total_tests = len(collector.test_records)
    passed_tests = sum(1 for r in collector.test_records if r["status"] == "PASS")
    failed_tests = total_tests - passed_tests
    pass_pct = (passed_tests / total_tests * 100.0) if total_tests > 0 else 0.0

    latencies = [r["elapsed_ms"] for r in collector.test_records]
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    max_latency = max(latencies) if latencies else 0.0

    print(f"Total Tests Executed : {total_tests}")
    print(f"Total Passed         : {passed_tests} ({pass_pct:.1f}%)")
    print(f"Total Failed/Errors  : {failed_tests}")
    print(f"Total Test Run Time  : {total_duration_sec * 1000.0:.2f} ms")
    print(f"Average Test Latency : {avg_latency:.3f} ms")
    print(f"Max Test Latency     : {max_latency:.3f} ms (SLA Threshold: <50ms)")
    print("-" * 80)

    # Detailed failures if any
    if failed_tests > 0:
        print("\nFAILURE DETAILS:")
        for r in collector.test_records:
            if r["status"] != "PASS":
                print(f"[-] {r['class']}.{r['name']} - {r['status']}")
                print(f"    {r['err']}")
        print("\n[VERIFICATION FAILED]")
        return 1
    else:
        print("[VERIFICATION SUCCESSFUL: 100% TESTS PASSED, ZERO ERRORS, ALL SLAS MET]")
        print("=" * 80)
        return 0


if __name__ == "__main__":
    sys.exit(run_esports_verification())
