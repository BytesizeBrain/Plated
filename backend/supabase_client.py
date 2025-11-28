# backend/supabase_client.py
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from .env file first
# This is the default file used in production/cloud deployments
load_dotenv()

# Override with env.development.local if it exists (for local development only)
# This file is git-ignored and won't exist in cloud deployments, so it's safe to check
# In cloud: this check will be False, so only .env will be used
# Locally: if this file exists, it will override .env values
dev_local_env = Path(__file__).parent / 'env.development.local'
if dev_local_env.exists():
    load_dotenv(dev_local_env, override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
