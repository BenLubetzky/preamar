# Picks which tasks fit into the user's free time.
# Pure logic (the function only computes, nothing else). The router loads the user's unfinished
# tasks and calls recommend.

from app.features.tasks.models import Task

def recommend(tasks: list[Task], minutes:int) -> list[Task]:
    """Return the tasks that fill the most minutes of the user's free time without going over.
    In the case of ties, pick the one that has the oldest first"""
    tasks = sorted(tasks, key=lambda task: task.created_at)
    n = len(tasks)
    can = [[False] * (minutes + 1) for _ in range(n + 1)]
    can[n][0] = True
    for i in range(n-1, -1, -1):
        d = tasks[i].duration_minutes
        for t in range(minutes + 1):
            if can[i+1][t]:
                can[i][t] = True
                if t + d <= minutes:
                    can[i][t+d] = True

    chosen = []
    best = max(t for t in range(minutes + 1) if can[0][t])
    remaining = best
    for i in range(n):
        d = tasks[i].duration_minutes
        if d <= remaining and can[i+1][remaining - d]:
            chosen.append(tasks[i])
            remaining -= d
    return chosen