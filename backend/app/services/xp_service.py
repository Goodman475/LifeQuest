import math
from datetime import date

def update_streak(user) -> None:
    """Call this every time a quest is completed. Updates streak and total_completed on the user object."""
    today = date.today().isoformat()

    if user.last_completed_date == today:
        # already completed something today, just increment total
        user.total_completed = (user.total_completed or 0) + 1
        return

    yesterday = date.fromordinal(date.today().toordinal() - 1).isoformat()

    if user.last_completed_date == yesterday:
        # continuing the streak
        user.streak = (user.streak or 0) + 1
    else:
        # streak broken or first completion
        user.streak = 1

    user.total_completed = (user.total_completed or 0) + 1
    user.last_completed_date = today

def xp_for_level(level: int) -> int:
    """XP required to complete level `level` (i.e. to go from level to level+1)."""
    base_xp = 100
    growth_rate = 1.25
    return int(base_xp * (level ** growth_rate))

def total_xp_for_level(level: int) -> int:
    """Total cumulative XP needed to reach `level` from level 1."""
    return sum(xp_for_level(i) for i in range(1, level))

def calculate_level(xp: int) -> int:
    """Calculate level from total XP. Starts at level 1."""
    level = 1
    while xp >= xp_for_level(level):
        xp -= xp_for_level(level)
        level += 1
    return level

def xp_into_current_level(xp: int) -> int:
    """XP progress into the current level."""
    level = calculate_level(xp)
    spent = sum(xp_for_level(i) for i in range(1, level))
    return max(0, xp - spent)

def xp_max_for_current_level(xp: int) -> int:
    """Total XP required to complete the current level."""
    level = calculate_level(xp)
    return xp_for_level(level)

def xp_needed_for_next_level(xp: int) -> int:
    """Remaining XP needed to level up."""
    return max(0, xp_max_for_current_level(xp) - xp_into_current_level(xp))