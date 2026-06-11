#!/usr/bin/env python3
"""
Compare locale JSON structures and report missing keys, extra keys, and
container type mismatches.

Usage:
    python .agents/skills/i18n-conventions/scripts/check_locale_keys.py messages/en.json messages/ar.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


DEFAULT_IGNORED_KEYS: set[str] = set()


def load_json(path: Path) -> Any:
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        print(f"[ERROR] File not found: {path}")
        sys.exit(2)
    except json.JSONDecodeError as exc:
        print(f"[ERROR] Invalid JSON in {path}: {exc}")
        sys.exit(2)


def json_kind(value: Any) -> str:
    if isinstance(value, dict):
        return "object"
    if isinstance(value, list):
        return "array"
    if isinstance(value, str):
        return "string"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, (int, float)):
        return "number"
    if value is None:
        return "null"
    return type(value).__name__


def flatten_paths(
    value: Any,
    ignored_keys: set[str],
    path: tuple[str, ...] = (),
) -> dict[str, str]:
    entries: dict[str, str] = {}

    if isinstance(value, dict):
        if path:
            entries[".".join(path)] = "object"
        for key, child in value.items():
            if key in ignored_keys:
                continue
            child_path = path + (key,)
            entries.update(flatten_paths(child, ignored_keys, child_path))
        return entries

    if isinstance(value, list):
        if path:
            entries[".".join(path)] = "array"
        return entries

    if path:
        entries[".".join(path)] = json_kind(value)
    return entries


def compare_locale_files(
    base_path: Path,
    compare_path: Path,
    ignored_keys: set[str],
) -> int:
    base = load_json(base_path)
    compare = load_json(compare_path)

    base_paths = flatten_paths(base, ignored_keys)
    compare_paths = flatten_paths(compare, ignored_keys)

    base_keys = set(base_paths)
    compare_keys = set(compare_paths)

    missing = sorted(base_keys - compare_keys)
    extra = sorted(compare_keys - base_keys)
    shared = sorted(base_keys & compare_keys)
    type_mismatches = [
        path
        for path in shared
        if base_paths[path] != compare_paths[path]
    ]

    problems = 0

    if missing:
        problems += len(missing)
        print(f"[MISSING] {compare_path} is missing {len(missing)} key(s):")
        for path in missing:
            print(f"  - {path}")

    if extra:
        problems += len(extra)
        print(f"[EXTRA] {compare_path} has {len(extra)} extra key(s):")
        for path in extra:
            print(f"  - {path}")

    if type_mismatches:
        problems += len(type_mismatches)
        print(f"[TYPE] {compare_path} has {len(type_mismatches)} type mismatch(es):")
        for path in type_mismatches:
            print(
                f"  - {path}: expected {base_paths[path]}, found {compare_paths[path]}"
            )

    if problems == 0:
        print(f"[OK] {compare_path} matches the key structure of {base_path}")

    return problems


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare locale JSON structures."
    )
    parser.add_argument("base", help="Base locale file, usually messages/en.json")
    parser.add_argument(
        "compare",
        nargs="+",
        help="Locale file(s) to compare with the base locale",
    )
    parser.add_argument(
        "--ignore-key",
        action="append",
        default=[],
        help="Object key to ignore during comparison. Repeat as needed.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    ignored_keys = DEFAULT_IGNORED_KEYS | set(args.ignore_key)
    base_path = Path(args.base)

    total_problems = 0
    for raw_path in args.compare:
        compare_path = Path(raw_path)
        total_problems += compare_locale_files(
            base_path,
            compare_path,
            ignored_keys,
        )

    return 1 if total_problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
