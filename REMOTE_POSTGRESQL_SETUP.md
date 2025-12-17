# Remote PostgreSQL Database Setup Guide

## Quick Options for Remote PostgreSQL

### Option 1: Supabase (FREE - Recommended for Development)

1. **Sign Up**: Go to [supabase.com](https://supabase.com)
2. **Create Project**:

   - Click "New Project"
   - Name: `remotehire`
   - Database Password: Create a strong password (SAVE THIS!)
   - Region: Choose closest to your location
   - Click "Create new project"

3. **Get Connection Details**:

   - Go to Project Settings (gear icon) → Database
   - Copy these values:
     ```
     Host: db.xxxxxxxxxxxxx.supabase.co
     Port: 5432
     Database: postgres
     User: postgres
     Password: [your password]
     ```

4. **Update Your .env File**:
   ```env
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_HOST=db.xxxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   ```

**Pros**: Free, 500MB storage, auto-backups, easy setup
**Cons**: Limited free tier

---

### Option 2: Neon (FREE Serverless)

1. **Sign Up**: Go to [neon.tech](https://neon.tech)
2. **Create Project**: Click "Create Project"
3. **Get Connection String**:
   ```
   postgres://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb
   ```
4. **Parse for .env**:
   - Extract Host, User, Password, Database from connection string

**Pros**: Generous free tier, serverless, fast
**Cons**: New service (less mature)

---

### Option 3: ElephantSQL (FREE up to 20MB)

1. **Sign Up**: [elephantsql.com](https://www.elephantsql.com)
2. **Create Instance**:
   - Click "Create New Instance"
   - Name: `remotehire`
   - Plan: Tiny Turtle (Free)
   - Region: Choose closest
3. **Get Details**: Click on instance name
   - Server: `[something].db.elephantsql.com`
   - User & Default database: `[same value]`
   - Password: [shown in details]

**Pros**: Simple, reliable
**Cons**: Only 20MB on free tier

---

### Option 4: AWS RDS (Production-Grade)

1. **AWS Console**: Navigate to RDS
2. **Create Database**:

   - Engine: PostgreSQL 15.x
   - Template: **Free tier** (for testing) or Production
   - DB instance identifier: `remotehire-db`
   - Master username: `postgres`
   - Master password: [create strong password]

3. **Instance Settings**:

   - DB instance class: `db.t3.micro` (free tier eligible)
   - Storage: 20GB (free tier)
   - Enable auto-scaling: No (for free tier)

4. **Connectivity**:

   - Public access: **Yes**
   - VPC security group: Create new
   - Security group rules: Add inbound rule
     - Type: PostgreSQL
     - Port: 5432
     - Source: `0.0.0.0/0` (for testing) or Your IP

5. **Wait 5-10 minutes** for creation

6. **Get Connection Details**:
   - Endpoint: `remotehire-db.xxxxxxxxxx.region.rds.amazonaws.com`
   - Port: 5432

**Pros**: Production-ready, scalable, reliable
**Cons**: Can be expensive after free tier

---

### Option 5: Self-Hosted on VPS (DigitalOcean/Vultr/Linode)

#### Step 1: Create a Droplet/Server

1. Sign up at [DigitalOcean](https://digitalocean.com), [Vultr](https://vultr.com), or [Linode](https://linode.com)
2. Create droplet: Ubuntu 22.04, $5/month plan
3. Note the IP address

#### Step 2: Install PostgreSQL

SSH into your server:

```bash
ssh root@your_server_ip
```

Install PostgreSQL:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Check status
sudo systemctl status postgresql
```

#### Step 3: Configure PostgreSQL for Remote Access

1. **Create Database and User**:

```bash
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE remotehire_db;
CREATE USER remotehire_user WITH PASSWORD 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE remotehire_db TO remotehire_user;
\q
```

2. **Edit postgresql.conf**:

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find and change:
listen_addresses = '*'  # Change from 'localhost' to '*'
```

3. **Edit pg_hba.conf**:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add at the end:
host    all             all             0.0.0.0/0               md5
```

4. **Configure Firewall**:

```bash
sudo ufw allow 5432/tcp
sudo ufw enable
```

5. **Restart PostgreSQL**:

```bash
sudo systemctl restart postgresql
```

#### Step 4: Update .env

```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=remotehire_db
DB_USER=remotehire_user
DB_PASSWORD=YourStrongPassword123!
DB_HOST=your_server_ip
DB_PORT=5432
```

**Pros**: Full control, good for learning
**Cons**: Requires maintenance, security management

---

## Configure Django to Use Remote Database

### Step 1: Create .env File

Create `remotehire_backend/.env`:

```env
# Database Configuration
DB_ENGINE=django.db.backends.postgresql
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=your_remote_host
DB_PORT=5432

# Other existing settings
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
LINKEDIN_OAUTH_CLIENT_ID=your_linkedin_client_id
LINKEDIN_OAUTH_CLIENT_SECRET=your_linkedin_client_secret
GEMINI_API_KEY=your_gemini_api_key

# AWS S3 (if using)
USE_S3=False
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=us-east-1
```

### Step 2: Install Required Package

```bash
cd remotehire_backend
pip install psycopg2-binary
```

### Step 3: Test Connection

```bash
python manage.py migrate
```

### Step 4: Create Superuser

```bash
python manage.py createsuperuser
```

---

## Security Best Practices

### 1. **Use SSL/TLS Connection**

Update settings.py:

```python
DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.postgresql'),
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',  # Add this for SSL
        },
    }
}
```

### 2. **Use Strong Passwords**

- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Use password generator

### 3. **Restrict IP Access**

- Don't use `0.0.0.0/0` in production
- Whitelist only your server IPs

### 4. **Regular Backups**

- Enable automated backups on cloud providers
- For self-hosted, use `pg_dump`:

```bash
pg_dump -h your_host -U your_user -d your_db > backup.sql
```

### 5. **Environment Variables**

- Never commit `.env` to git
- Add to `.gitignore`:

```
.env
*.env
```

---

## Troubleshooting

### Connection Refused

- Check firewall rules
- Verify PostgreSQL is listening on 0.0.0.0
- Check security group settings (cloud)

### Authentication Failed

- Double-check password
- Verify user has permissions
- Check pg_hba.conf settings

### Timeout

- Check if server is running
- Verify network connectivity
- Check if IP is whitelisted

### SSL Error

- If remote DB requires SSL, add `OPTIONS: {'sslmode': 'require'}`
- If testing without SSL, use `'sslmode': 'disable'`

---

## Recommended: Supabase for Quick Start

**For RemoteHire.io development, I recommend Supabase:**

1. ✅ Free tier is generous (500MB)
2. ✅ Setup in 2 minutes
3. ✅ Built-in dashboard
4. ✅ Automatic backups
5. ✅ SSL by default
6. ✅ No server maintenance

Just create account → get credentials → update .env → migrate!
