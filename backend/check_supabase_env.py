import os
from dotenv import load_dotenv

load_dotenv()

print("SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("SUPABASE_ANON_KEY is set:", bool(os.getenv("SUPABASE_ANON_KEY")))
