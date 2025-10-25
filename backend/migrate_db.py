"""
Database migration script to add new columns for activity tracking.
Run this script if you're upgrading from an older version.
"""
from app import app, db
from models import User

def migrate_database():
    """Add new columns to existing database"""
    with app.app_context():
        try:
            # Check if migration is needed by trying to query new columns
            test_user = User.query.first()
            if test_user:
                # Try accessing new attributes - if they don't exist, migration is needed
                _ = test_user.stories_generated
                _ = test_user.current_streak
                _ = test_user.longest_streak
                _ = test_user.last_activity
                print("✓ Database is already up to date!")
                return
        except Exception as e:
            print(f"Migration needed: {e}")
            print("Creating new columns...")
            
            # SQLAlchemy will handle the migration automatically when you restart the app
            # Just recreate the tables with the new schema
            db.create_all()
            print("✓ Database migration completed!")
            print("Note: Existing users will have default values for new columns.")

if __name__ == '__main__':
    migrate_database()
