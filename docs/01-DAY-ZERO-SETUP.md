# Day-Zero Setup — every team member does this

**Time needed:** about 1 hour
**Do this before Sprint 1 starts. Don't skip steps because "I already have Python".**

At the end of this you will have: the repo cloned, the backend running locally, the frontend running locally, and AWS CLI talking to the team account.

---

## Step 1 — Install the tools

### Windows
Install [Git for Windows](https://git-scm.com/download/win) first, then open **Git Bash** and use that for every command in these docs. Not PowerShell, not CMD — Git Bash. It saves you a hundred small path problems.

```bash
# Then install these (download the installers):
# - Node.js 20 LTS       https://nodejs.org
# - Python 3.12          https://www.python.org/downloads/  (TICK "Add Python to PATH")
# - AWS CLI v2           https://awscli.amazonaws.com/AWSCLIV2.msi
# - AWS SAM CLI          https://github.com/aws/aws-sam-cli/releases/latest  (the .msi)
# - VS Code              https://code.visualstudio.com
# - Docker Desktop       https://www.docker.com/products/docker-desktop  (needed for `sam local`)
```

### macOS
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node@20 python@3.12 awscli aws-sam-cli git
brew install --cask visual-studio-code docker
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3-pip git curl unzip
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip && unzip awscliv2.zip && sudo ./aws/install
# SAM CLI:
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation && sudo ./sam-installation/install
```

### Verify — all five must print a version
```bash
node --version      # v20.x
python3 --version   # 3.12.x
aws --version       # aws-cli/2.x
sam --version       # 1.x
git --version
```

If any of these fail, **stop and fix it now**. Do not continue and hope.

---

## Step 2 — VS Code extensions

Install these five so everyone's editor formats code identically (this prevents fake merge conflicts where the only change is whitespace):

- **Python** (ms-python.python)
- **Ruff** (charliermarsh.ruff) — Python linting/formatting
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **AWS Toolkit** (amazonwebservices.aws-toolkit-vscode)

The repo ships a `.vscode/settings.json` that turns on format-on-save. Don't override it.

---

## Step 3 — Configure Git (once)

```bash
git config --global user.name "Your Real Name"
git config --global user.email "your@email.com"     # the email on your GitHub account
git config --global pull.rebase true                 # keeps history clean, fewer merge commits
git config --global init.defaultBranch main
```

If you've never pushed to GitHub from this machine, set up an SSH key:

```bash
ssh-keygen -t ed25519 -C "your@email.com"   # press Enter 3 times
cat ~/.ssh/id_ed25519.pub                    # copy the whole output
# Paste it at: https://github.com/settings/keys → "New SSH key"
ssh -T git@github.com                        # should say "Hi <username>! You've successfully authenticated"
```

---

## Step 4 — Clone the repo

```bash
cd ~                       # or wherever you keep projects
git clone git@github.com:<client-org>/gym-plan-v2.git
cd gym-plan-v2
git checkout dev           # we work off dev, never main
```

> If `dev` doesn't exist yet, Mustheer creates it in Sprint 0. Ask him.

---

## Step 5 — AWS CLI credentials

Mustheer will send you, privately (**not in the group chat**), an Access Key ID and Secret Access Key for your IAM user.

```bash
aws configure
# AWS Access Key ID:     <paste>
# AWS Secret Access Key: <paste>
# Default region name:   us-east-1
# Default output format: json
```

Test it:
```bash
aws sts get-caller-identity
```

You should see your account ID and a `user/fitplan-<yourname>` ARN. If you get `InvalidClientTokenId`, the key is wrong — ask Mustheer to reissue it.

**Rules about these keys:**
- Never paste them into a chat, a screenshot, a commit, or a Stack Overflow question.
- They live only in `~/.aws/credentials`, which is outside the repo.
- If you think one leaked, tell Mustheer immediately. Rotating a key takes 2 minutes; cleaning up a compromised account takes days.

---

## Step 6 — Backend running locally

```bash
cd backend
python3 -m venv .venv

# activate it:
source .venv/bin/activate        # macOS/Linux/Git Bash
# .venv\Scripts\activate         # Windows CMD/PowerShell

pip install --upgrade pip
pip install -r requirements-dev.txt

# sanity check
python -c "import boto3, pydantic; print('backend ok')"
pytest -q                         # the scaffold ships with a couple of trivial tests
```

You should see `backend ok` and passing tests.

**Every time you open a new terminal for backend work, activate the venv first.** Ninety percent of "it works on my machine" is a forgotten venv.

---

## Step 7 — Frontend running locally

```bash
cd ../frontend
npm install
cp .env.example .env       # fill in real values in Sprint 2
npm run dev
```

Open http://localhost:5173 — you should see the FitPlan shell.

---

## Step 8 — Post in the group when you're done

Post exactly this so Mustheer can track who's unblocked:

```
✅ Day-zero done
node: v20.x
python: 3.12.x
sam: 1.x
aws sts: works
backend: pytest passes
frontend: localhost:5173 loads
```

---

## Common problems

| Symptom | Fix |
|---|---|
| `python: command not found` on Windows | You didn't tick "Add Python to PATH". Re-run the installer → Modify → tick it. |
| `sam --version` not found after install | Restart your terminal. Windows needs a full restart sometimes. |
| `npm install` fails with permission errors | Never use `sudo npm`. Fix ownership: `sudo chown -R $(whoami) ~/.npm` |
| `aws sts get-caller-identity` → `ExpiredToken` | Your key was deactivated. Ask Mustheer for a new one. |
| `pip install` fails building a wheel | You're on Python 3.13+ or 3.11-. We need **3.12**. Check `python3 --version`. |
| Docker not running (`sam local` fails) | Start Docker Desktop. It must be actively running, not just installed. |
| VS Code reformats the whole file on save | Wrong formatter picked. Cmd/Ctrl+Shift+P → "Format Document With..." → Prettier for TS, Ruff for Python. |
| Git asks for a password on push | You're on HTTPS, not SSH. `git remote set-url origin git@github.com:<org>/gym-plan-v2.git` |
