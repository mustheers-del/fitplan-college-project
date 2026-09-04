"""Every common module must import successfully."""

import importlib
import pkgutil

import common


def test_all_common_modules_import():
    failures = []

    for mod in pkgutil.iter_modules(common.__path__):
        try:
            importlib.import_module(f"common.{mod.name}")
        except Exception as exc:
            failures.append(
                f"{mod.name}: {type(exc).__name__}: {exc}"
            )

    assert not failures, (
        "modules failed to import:\n" + "\n".join(failures)
    )