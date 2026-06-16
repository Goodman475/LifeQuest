import random
from sqlalchemy.orm import Session
from app.models.quest import Quest


def generate_quest(i: int):
    templates = [
        {
            "skill_type": "health",
            "titles": [
                "Drink a full glass of water",
                "Eat a nutritious breakfast",
                "Take a 10-minute stretch break",
                "Swap soda for herbal tea today",
                "Prepare a balanced meal with vegetables",
                "Do a 5-minute guided stretching routine",
                "Eat a piece of fruit",
                "Practice good posture all day",
                "Get 8 hours of sleep tonight",
                "Take a cold shower",
                "Do facial exercises",
                "Drink green tea",
                "Eat almonds or nuts",
                "Take a warm bath",
                "Practice eye exercises",
            ],
        },
        {
            "skill_type": "strength",
            "titles": [
                "Complete a 15-minute bodyweight workout",
                "Do 20 pushups with good form",
                "Finish a circuit of squats and lunges",
                "Try a dumbbell strength session",
                "Build a strong core with planks",
                "Do mountain climbers for 2 minutes",
                "Complete 30 seconds of handstand practice",
                "Do a set of 15 burpees",
                "Finish a resistance band workout",
                "Do 30 pull-ups total",
                "Complete a kettlebell session",
                "Do wall sits for 3 minutes",
                "Perform 20 dips",
                "Do farmer's carries",
                "Complete a TRX workout",
            ],
        },
        {
            "skill_type": "knowledge",
            "titles": [
                "Read a chapter from a book",
                "Watch a short educational video",
                "Practice a new concept for 20 minutes",
                "Learn five new vocabulary words",
                "Review a helpful productivity article",
                "Take a free online course lesson",
                "Listen to a podcast episode",
                "Read about a historical event",
                "Learn a new language for 15 minutes",
                "Study a new skill for 30 minutes",
                "Read a scientific paper summary",
                "Learn a new programming concept",
                "Memorize 10 facts about a topic",
                "Take an online quiz",
                "Study for a certification exam",
            ],
        },
        {
            "skill_type": "mindfulness",
            "titles": [
                "Meditate for 10 minutes",
                "Write in your journal",
                "Practice deep breathing exercises",
                "Take a mindful walk without your phone",
                "Reflect on three good things today",
                "Practice gratitude journaling",
                "Do a body scan meditation",
                "Take 5 minutes for mindful breathing",
                "Reflect on your goals and progress",
                "Practice loving-kindness meditation",
                "Do a guided visualization",
                "Spend time in nature",
                "Practice mindful eating",
                "Do a digital detox hour",
                "Reflect on your values",
            ],
        },
        {
            "skill_type": "endurance",
            "titles": [
                "Take a brisk 20-minute walk",
                "Run for 10 minutes at an easy pace",
                "Complete a cardio interval set",
                "Climb stairs for 10 minutes",
                "Do a low-impact endurance routine",
                "Bike for 15 minutes",
                "Swim for 10 minutes",
                "Jump rope for 5 minutes",
                "Do a 20-minute hiking session",
                "Row for 10 minutes",
                "Do a 30-minute light jog",
                "Dance for 20 minutes",
                "Do elliptical for 15 minutes",
                "Walk 10,000 steps",
                "Do a long-distance cycle ride",
            ],
        },
    ]

    choice = random.choice(templates)
    title = random.choice(choice["titles"])
    difficulty = random.choice(["easy", "medium", "hard"])
    xp_base = {"easy": 25, "medium": 45, "hard": 65}[difficulty]

    return {
        "title": title,
        "description": f"Complete this {choice['skill_type']} goal to build consistency.",
        "xp_reward": xp_base + random.randint(0, 15),
        "skill_type": choice["skill_type"],
        "difficulty": difficulty,
    }


def seed_default_quests(db: Session, count: int = 75):
    existing = db.query(Quest).count()
    if existing > 0:
        return

    for i in range(1, count + 1):
        quest_data = generate_quest(i)
        quest = Quest(**quest_data)
        db.add(quest)

    db.commit()
