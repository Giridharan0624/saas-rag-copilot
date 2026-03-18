"""
Module 6 — Answer Selection
Picks the single best result from the hybrid-retrieval output.
"""


def select_best(results: list[dict]) -> dict | None:
    """
    From a list of result dicts (already sorted by descending RRF score),
    return the top-ranked one or None if the list is empty.
    """
    if not results:
        return None
    return results[0]
