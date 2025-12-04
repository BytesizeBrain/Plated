from supabase_client import supabase

print("Testing Supabase...")
r = supabase.table("posts").select("*").limit(1).execute()
print(r)
