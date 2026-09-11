import json
import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import Problem

def clean_text(text):
    if text is None:
        return None
    return text.strip()

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Locate JSON files relative to this script or current working directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        (os.path.join(base_dir, '..', 'physics_problems.json'), os.path.join(base_dir, '..', 'physics_problems_exam2.json')),
        (os.path.join(os.getcwd(), 'physics_problems.json'), os.path.join(os.getcwd(), 'physics_problems_exam2.json')),
    ]
    
    file1, file2 = None, None
    for f1, f2 in candidates:
        if os.path.exists(f1) and os.path.exists(f2):
            file1, file2 = f1, f2
            break
            
    if not file1 or not file2:
        raise FileNotFoundError("Could not locate physics_problems.json and physics_problems_exam2.json")

    with open(file1, 'r', encoding='utf-8') as f:
        data1 = json.load(f)
        
    with open(file2, 'r', encoding='utf-8') as f:
        data2 = json.load(f)
        
    all_data = data1 + data2
    print(f"Found {len(data1)} problems in Set 1, {len(data2)} problems in Set 2. Total: {len(all_data)}")
                
    inserted_or_updated = 0
    for item in all_data:
        problem_id = item['problem_id']
        image_file = item.get('image_file')
        problem_text = clean_text(item.get('problem_text', ''))
        correct_value = float(item.get('correct_numerical_value', 0.0))
        topic = item.get('topic', 'Unknown')
        unit = item.get('unit')
            
        # Check if problem already exists
        prob = db.query(Problem).filter(Problem.problem_id == problem_id).first()
        if not prob:
            prob = Problem(
                problem_id=problem_id,
                topic=topic,
                problem_text=problem_text,
                correct_value=correct_value,
                unit=unit,
                image_file=image_file
            )
            db.add(prob)
        else:
            prob.topic = topic
            prob.problem_text = problem_text
            prob.correct_value = correct_value
            prob.unit = unit
            prob.image_file = image_file
            
        inserted_or_updated += 1
        
    db.commit()
    count = db.query(Problem).count()
    db.close()
    print(f"Seeded {inserted_or_updated} problems successfully. Total problems in DB: {count}")

if __name__ == '__main__':
    seed_database()
