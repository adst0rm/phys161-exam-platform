import json
import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import Problem

def fix_unicode(text):
    if text is None:
        return None
    # Add any specific character replacements if necessary based on data inspection.
    # The JSON string reading handles standard unicode. 
    # If there are garbled chars like '+', we can replace them:
    text = text.replace('+', '±')
    text = text.replace('?', 'Δ') # Just a guess for some garbled chars, but better to keep it if unsure
    # Let's do basic cleanup
    return text

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    with open('../physics_problems.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    image_dir = '../public/images'
    existing_images = set()
    if os.path.exists(image_dir):
        for file in os.listdir(image_dir):
            if file.endswith('.png'):
                existing_images.add(file)
                
    inserted_or_updated = 0
    for item in data:
        problem_id = item['problem_id']
        
        # Check if an image exists for this problem
        image_file = f"{problem_id}.png"
        if image_file in existing_images:
            item['image_file'] = image_file
        else:
            item['image_file'] = None
            
        # Check if problem already exists
        prob = db.query(Problem).filter(Problem.problem_id == problem_id).first()
        if not prob:
            prob = Problem(
                problem_id=problem_id,
                topic=item.get('topic', 'Unknown'),
                problem_text=fix_unicode(item.get('problem_text', '')),
                correct_value=item.get('correct_numerical_value', 0.0),
                unit=item.get('unit'),
                image_file=item.get('image_file')
            )
            db.add(prob)
        else:
            prob.topic = item.get('topic', 'Unknown')
            prob.problem_text = fix_unicode(item.get('problem_text', ''))
            prob.correct_value = item.get('correct_numerical_value', 0.0)
            prob.unit = item.get('unit')
            prob.image_file = item.get('image_file')
            
        inserted_or_updated += 1
        
    db.commit()
    db.close()
    print(f"Seeded {inserted_or_updated} problems successfully.")

if __name__ == '__main__':
    seed_database()
